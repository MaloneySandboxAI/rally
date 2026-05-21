# Rally — Full Codebase Code Review

*Reviewer: Claude · Date: 2026-05-20 · Scope: entire repo (~22k LOC, Next.js 16 + Supabase + Vercel)*

This is a written review only — no code was changed. Findings are ordered by
severity (Critical → High → Medium → Low → Suggestions). Every finding cites
file paths and line numbers.

A note on confidence: the `supabase/migrations/` folder does **not** contain
the `CREATE TABLE` statements for the base tables (`users`, `challenges`,
`sat_questions`) — they were created outside the tracked migrations. Some
findings about RLS/grants therefore depend on the live database state, which
could not be inspected directly. Those are flagged inline.

---

## Summary

The app is feature-rich and the recent security migration (`022`) closed
several real holes (world-readable `push_subscriptions`, forgeable challenge
updates, unauthorized H2H writes, forgeable group leaderboards). However, the
same *class* of bug — `RLS USING (true)` on a table that holds private data —
still exists on two other tables, and the application's economy/competition
state is entirely client-authoritative. The single biggest structural risk is
`next.config.mjs` `ignoreBuildErrors: true`, which is actively masking at least
one runtime-breaking bug (Next 16 async `params`).

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 4 |
| Medium | 12 |
| Low | 11 |
| Suggestions | ~12 |

---

## CRITICAL

### C1. `waitlist` table is world-readable — exposes email addresses
**`scripts/004_rebuild_waitlist_table.sql:19`**

```sql
CREATE POLICY "Service role can read" ON waitlist FOR SELECT USING (true);
```

The `waitlist` table stores pairs of email addresses (`challenger_email`,
`friend_email` — see lines 9-11). The original policy in
`scripts/001_create_waitlist.sql:19-21` was correctly `USING (false)`; the
rebuild script regressed it to `USING (true)`. The policy is *named* "Service
role can read", but the service role bypasses RLS anyway — so `USING (true)`
only grants read access to the **anon** and **authenticated** roles. Supabase
grants `SELECT` on new `public` tables to those roles by default, and the anon
key is shipped in the client bundle. Net effect: anyone can dump every email
pair on the waitlist.

Migration `005_security_hardening.sql:143,149` only adds `GRANT INSERT` for
waitlist; `GRANT` is additive and does not revoke the default `SELECT`.

This is the exact bug class that migration `022` flagged as critical for
`push_subscriptions` — it was simply missed here. Fix: drop the policy (no
client read needed) or scope reads to the service role only via a SECURITY
DEFINER RPC. *(Confidence: depends on whether `scripts/004` was actually run
against prod, since it lives in `scripts/` not `migrations/`.)*

### C2. `parent_tokens` is fully enumerable — exposes minors' progress data
**`supabase/migrations/008_parent_tokens.sql:44-46`**

```sql
CREATE POLICY "Anyone can read by token" ON parent_tokens FOR SELECT USING (true);
```

The intent is "a parent who has the secret token can read that one row." But
RLS `USING (true)` does not implement "read by token" — the `WHERE token = ?`
filter lives in the *query*, not the policy. Anyone with the anon key can run
`SELECT * FROM parent_tokens` and retrieve **every** token, every
`student_name`, and every `snapshot` (category levels, streaks, accuracy,
activity — see `lib/parent-dashboard.ts:223-240`). The token stops being a
secret the moment all rows are selectable.

`app/parent/[token]/page.tsx:35-40` reads the table client-side with the anon
key, confirming the exposure path. Because Rally is an explicitly
age-gated/COPPA-aware product (`app/age-verify/page.tsx`), exposing children's
progress data is a compliance issue, not just a privacy one.

Correct fix (same shape as the `022` push-notification fix): drop the public
policy and serve the parent page through a `SECURITY DEFINER` RPC
`get_parent_snapshot(p_token text)` that filters by token server-side, so a
caller can only ever retrieve the row whose token they already know.

---

## HIGH

### H1. Head-to-head records are inflatable by a participant
**`supabase/migrations/022_critical_rls_fixes.sql:145-214`,
`app/challenge/[code]/page.tsx:74-89`, `lib/head-to-head.ts:11-18`**

Migration `022` hardened `upsert_h2h_record` to require (a) the caller is one
of the two players and (b) a completed challenge backs the win/loss. But it
does **not** enforce "record this challenge only once." The only
once-per-challenge guard is the `h2h_recorded` boolean, and it is checked and
set entirely on the **client**:

```ts
// app/challenge/[code]/page.tsx:76-84
if (!c.h2h_recorded) {
  ...
  recordH2HResult(winnerId, loserId, c.category)
  supabase.from("challenges").update({ h2h_recorded: true }).eq("share_code", code)
}
```

Two problems:
1. **Race:** if both players open the completed-challenge page around the same
   time, both load `h2h_recorded = false`, both call the RPC, and the win is
   counted twice (the RPC does `ON CONFLICT ... DO UPDATE SET player1_wins =
   player1_wins + 1`). This is the "H2H record inflation" the project notes
   claim was fixed — it is only *mitigated*, not fixed.
2. **Deliberate inflation:** a participant can call `recordH2HResult` directly
   in a loop. The RPC's "a completed challenge supports this result" check
   passes on every call, and nothing checks `h2h_recorded`. A user can pump
   their win count arbitrarily.

Fix: move the idempotency into the `SECURITY DEFINER` RPC — pass the challenge
id, and inside the function atomically `UPDATE challenges SET h2h_recorded =
true WHERE id = ? AND h2h_recorded = false` and only increment when that update
affected a row.

### H2. Server-side state sync is silently completely broken
**`lib/sync.ts:104-105` vs `supabase/migrations/006_user_state.sql:8-25`**

`syncToServer()` upserts these keys into `user_state`:

```ts
stats, subtopic_levels, diagnostic, ...
```

But the `user_state` table (migration `006_user_state.sql`) has **no
`subtopic_levels` column and no `diagnostic` column**. A PostgREST upsert with
unknown columns fails the entire statement, and the error is swallowed:

```ts
} catch {
  // Silently fail — local state is the source of truth until sync succeeds
}
```

So `syncToServer()` never persists anything, and `syncFromServer()`
(`lib/sync.ts:120-154`) reads back columns that were never written.
`best_streak` is also never written. The entire point of the `user_state`
table per its own header comment — "survive app reinstalls and sync across
devices (critical for iOS)" — does not work. On an iOS reinstall the user
loses all gems, streaks, and progress.

`lib/subtopic-levels.ts:17` even documents storage as "localStorage + Supabase
`user_state.subtopic_levels`", a column that doesn't exist.

Fix: add the missing columns (`subtopic_levels jsonb`, `diagnostic jsonb`,
write `best_streak`) **and** stop swallowing the upsert error so this is never
silent again.

### H3. Parent dashboard page is broken under Next.js 16
**`app/parent/[token]/page.tsx:26`**

```ts
export default function ParentDashboardPage({ params }: { params: { token: string } }) {
  ...
  .eq("token", params.token)   // line 39
```

`package.json:54` pins `next@16.1.6`. In Next 15+, route `params` is a
`Promise`; in Next 16 synchronous access is removed. The page reads
`params.token` directly (no `React.use(params)` / `await`), so at runtime
`params.token` is `undefined`, the query becomes `.eq("token", undefined)`, and
every parent loads "link not found." The challenge and group pages avoid this
because they use the `useParams()` hook (`app/challenge/[code]/page.tsx:20`,
`app/group/[code]/page.tsx:23`) — only the parent page uses the prop form.

This would normally be a compile error, but it is hidden by
`next.config.mjs:3-5` `ignoreBuildErrors: true` (see M11). Fix: `const { token }
= use(params)` and type `params` as `Promise<{ token: string }>`.

### H4. Upgrade/checkout flow relies on undocumented, mismatched env vars
**`app/upgrade/page.tsx:34-36` vs `.env.example:14-15`**

```ts
const priceId = selectedPlan === "monthly"
  ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
  : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID
```

`.env.example` only documents `STRIPE_MONTHLY_PRICE_ID` /
`STRIPE_ANNUAL_PRICE_ID` (no `NEXT_PUBLIC_` prefix). A non-`NEXT_PUBLIC_`
variable is not exposed to client code, so unless these `NEXT_PUBLIC_` variants
are *separately* configured in Vercel, `priceId` is `undefined`, the POST body
is `{ priceId: undefined, ... }`, and
`app/api/stripe/create-checkout-session/route.ts:13-14` returns 400 "Missing
required fields." The entire monetization path silently fails.

Related: the checkout route trusts the client-supplied `priceId`
(`create-checkout-session/route.ts:11,61`). The server should map a plan name
(`"monthly"`/`"annual"`) to a price ID server-side rather than accepting an
arbitrary Stripe price from the client.

---

## MEDIUM

### M1. `users` RLS exposes every column of every user to any logged-in user
**`supabase/migrations/005_security_hardening.sql:67-69`**

```sql
CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT USING (auth.uid() IS NOT NULL);
```

The policy comment itself admits "Column-level restriction isn't possible via
RLS … the client only ever selects specific safe columns." That is a hope, not
a control — any authenticated user can `SELECT *` and read every other user's
`stripe_customer_id`, `subscription_status`, `current_period_ends_at`,
`trial_ends_at`, `referred_by`. Fix: expose only public columns (`id`,
`username`, `referral_code`) through a view or a `SECURITY DEFINER` lookup
function, and keep the base table private.

### M2. Economy and competition state are fully client-authoritative
**`lib/gem-context.tsx`, `lib/sync.ts:94`, `lib/challenges.ts`,
`lib/hearts.ts`, `lib/access.ts`**

- Gems live in `localStorage` (`gem-context.tsx:6,47-53`) and
  `syncToServer()` writes whatever number is in localStorage straight to
  `user_state.gems` (`sync.ts:94`). `localStorage.setItem("rally_gems",
  "999999")` is a valid balance.
- Challenge scores are written from the client: `complete_challenge`'s
  `p_challenger_score` (`challenges.ts:178-183`) and `updateCreatorResults`
  (`challenges.ts:118-126`) take whatever the browser computed in
  `app/play/page.tsx`. `getLeaderboard()` (`challenges.ts:234-281`) and the
  H2H feature both build on these unverified scores — the leaderboard and
  win/loss records are forgeable.
- The free-tier gates are localStorage flags: `rally_is_pro`
  (`hearts.ts:12,22-25`) bypasses hearts/round limits; the daily-challenge
  counter (`access.ts:3-5,54-63`) and daily gem cap
  (`premium-context.tsx`, counted only client-side) reset by clearing
  localStorage. The premium upsell the product is built around is not
  enforced anywhere server-side.

For a study app where "gems" are not real currency this is a *product
integrity* issue, not a financial one — but the leaderboard, H2H rivalry, and
the entire "upgrade to lift the cap" funnel are only as honest as the client.
At minimum, validate score plausibility server-side (e.g. a challenge score
cannot exceed `15 questions × max per-question gems`).

### M3. Stripe webhook always returns 200, even when the DB write fails
**`app/api/stripe/webhook/route.ts:111-114`**

```ts
} catch (err) {
  console.error(...)
  // Return 200 anyway so Stripe doesn't retry
}
```

If the Supabase update throws (transient outage, network blip), the webhook
still returns `{ received: true }`, Stripe marks the event delivered, and the
user's `subscription_status` permanently drifts from Stripe's truth — a paying
user can be stuck as `free`. Distinguish *signature/parse* failures (return
400, never retry) from *processing* failures (return 5xx so Stripe retries).
There is also no event-id idempotency/dedup — Stripe can deliver an event more
than once.

### M4. Open redirect via `returnTo`
**`app/age-verify/page.tsx:24-33`**

```ts
if (dest && dest.startsWith("/")) { return dest }
```

`startsWith("/")` is not sufficient: `//evil.com` starts with `/` and is a
protocol-relative URL, so `router.replace("//evil.com")` navigates off-site.
`returnTo` flows unvalidated from `/login?returnTo=…` → `auth/callback`
(`route.ts:39-42,75-78`) → `setup-profile` → `age-verify`. Reject any value
that starts with `//` or contains `:`; only allow same-origin relative paths.

### M5. "Delete account" does not delete server-side data
**`app/account/page.tsx:56-79`**

`handleDeleteAccount` clears a hard-coded list of localStorage keys and signs
out. It does not delete the `users`, `user_state`, `challenges`,
`parent_tokens`, `push_subscriptions`, `referrals`, `feedback`, or
`head_to_head` rows. The confirmation copy says "permanently delete all your
data" (line 311) — that is inaccurate; the code comment (line 72-73) admits
real deletion requires an email to a human. For a COPPA/GDPR-relevant app
this right-to-erasure gap should be a real server-side cascade (an API route
using the service role / Supabase Admin API).

### M6. COPPA age gate is purely client-side
**`app/age-verify/page.tsx`**

Verification stores `localStorage.setItem("rally_age_verified", "true")`
(line 69) with no server record. It is bypassable by setting the key directly,
and the under-13 block (lines 56-65) just signs out — a user can re-enter a
different year. There is no server-side record that age screening occurred. An
age *screen* is industry-standard, but consider persisting a verified flag /
birth year server-side so it cannot be trivially cleared and so it survives
device changes.

### M7. SECURITY DEFINER functions without a pinned `search_path`
**migrations `004:44-52`, `006_user_state.sql:43-50`, `014:13-49`, `018:27-42`,
`019:25-57`**

`handle_new_user`, `create_user_state`, `generate_referral_code`,
`claim_referral_bonuses`, and the original `upsert_h2h_record` are
`SECURITY DEFINER` but do not `SET search_path`. A `SECURITY DEFINER` function
without a pinned search_path is the classic Postgres privilege-escalation
vector. Migration `022` does this correctly (`SET search_path = public,
pg_temp` on every function it defines) — the older functions were never
back-patched. Add `SET search_path = public, pg_temp` to each.

### M8. `not.in.(...)` exclude lists grow unbounded
**`lib/questions.ts:53,97,119,268`**

`getQuestions` / `getOneQuestion` build the "already seen" filter by
string-joining accumulated IDs: `query.not("id", "in", \`(${excludeIds.join(",")})\`)`.
`app/play/page.tsx` keeps `sessionUsedIds` at module scope and never clears it
except on full exhaustion (`play/page.tsx:58,104-107`). Over a long session
this list keeps growing, the PostgREST request URL keeps growing, and a large
enough list will hit a `414 URI Too Long` or simply make every query slower.
Cap the exclude set, or track seen IDs server-side, or page through questions.

### M9. Group-challenge guest entries are matched by display name
**`lib/group-challenges.ts:147-151`**

```ts
if (params.playerId) query = query.eq("player_id", params.playerId)
else query = query.eq("player_name", params.playerName)
```

For a guest (no `playerId`), `submitGroupEntry` updates *every* entry in the
challenge with that `player_name`. Two guests named "guest" collide; one's
score lands on the other's row. RLS (migration `022`) only prevents
overwriting an *already-scored* guest entry, not this name-based mismatch.
Guest entries need a stable per-device identifier.

### M10. Challenge-result submission failures are invisible to the user
**`app/play/page.tsx:751-771,787-808`**

When `updateCreatorResults` / `completeChallenge` / `notifyChallengeOpponent`
fail, the only handling is `console.error`. The player still sees a normal
results screen and believes the challenge was recorded; the opponent never
gets the row or the notification. Surface a retry affordance or a visible
error toast on failure.

### M11. Build config disables all type/lint gating; no CSP
**`next.config.mjs:3-11`**

```ts
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

This is the root enabler of H3 (a runtime-breaking type error shipped to
production). With no CI beyond Vercel auto-deploy, nothing anywhere checks the
code before it goes live. The security headers block (lines 12-25) is good
(HSTS, `X-Frame-Options`, etc.) but there is **no `Content-Security-Policy`**,
which is the header that actually mitigates XSS. Recommend: fix the underlying
type errors, flip both flags to `false`, add a CSP, and add a GitHub Action
running `tsc --noEmit` + `eslint` + tests.

### M12. `complete_challenge` RPC is granted to `anon`
**`supabase/migrations/022_critical_rls_fixes.sql:134`**

Granting `complete_challenge` to `anon` is *intentional* (guests can finish a
challenge) and the function derives `challenger_id` from `auth.uid()`, so it
cannot forge identity. The residual issue is purely M2: the *score* parameter
is still client-supplied. Noting it here so the `anon` grant is not mistaken
for the whole story — it is safe only once score validation exists.

---

## LOW

### L1. `QuestionTrackerProvider` is dead code
`app/layout.tsx:8,84-90` mounts `QuestionTrackerProvider`, but
`useQuestionTracker` is never consumed anywhere (`grep` confirms only the
definition file and the layout reference it). `app/play/page.tsx:56-107` uses a
module-level `sessionUsedIds` object instead. Delete
`lib/question-tracker-context.tsx` and the provider, or actually use it. Note
also that its `CategoryKey` type (`question-tracker-context.tsx:6`) covers only
the 4 SAT categories — it would throw on AP categories.

### L2. 47 `console.*` calls shipped to production
`grep` finds 47 `console.log/warn/error` across `app/`, `lib/`,
`components/rally/`, including verbose `[v0]` debug logs in the hot path
(`app/play/page.tsx:97,105,245,279,302,321`). Strip debug logging or gate it
behind `NODE_ENV`.

### L3. Duplicate Supabase client construction
`lib/questions.ts:11-16` builds its own `@supabase/supabase-js` client (its own
`GoTrueClient`) instead of reusing `lib/supabase/client.ts`. This is the
multiple-GoTrueClient situation the comment is trying to dodge; it should use
the shared singleton.

### L4. Stale "48 hours" copy vs 7-day expiry
`CHALLENGE_EXPIRY_HOURS = 168` (`lib/challenges.ts:284`), but the doc comment
on `isChallengeExpired` (`challenges.ts:287-288`) says "48 hours" and
`app/challenge/[code]/page.tsx:236` tells users "Challenges last 48 hours."
User-facing copy is wrong.

### L5. Zoom disabled — accessibility (WCAG 1.4.4)
`app/layout.tsx:19-25` sets `maximumScale: 1, userScalable: false`. This blocks
pinch-zoom for low-vision users across the whole app. Remove both.

### L6. Landing-page mobile menu toggle has no accessible name
`app/page.tsx:195` — the `<button className="md:hidden">` contains only an
icon, no `aria-label`. Screen readers announce an unlabeled button.

### L7. Service-role client setup is fragile
`lib/supabase/server.ts:4` — `SUPABASE_SERVICE_ROLE_KEY || ''` falls back to an
empty string; a missing env var produces confusing downstream errors instead
of failing fast. The client is also created without `auth: { persistSession:
false, autoRefreshToken: false }`, which is the recommended config for a
server/service client.

### L8. Migration set is not a reproducible schema
`supabase/migrations/` has duplicate numeric prefixes (`006`, `006`, `006b`;
`009`×4; `011`×3; `013`×5) and — more importantly — contains no `CREATE TABLE`
for the base `users`, `challenges`, or `sat_questions` tables (every early
migration only `ALTER`s them). The database cannot be rebuilt from this folder.
Capture a baseline schema migration.

### L9. Errors swallowed in fire-and-forget helpers
`lib/head-to-head.ts:11-18` (`recordH2HResult`) and `lib/challenge-notify.ts`
(`notifyChallengeOpponent`) discard all errors. `notifyChallengeOpponent` also
still receives dead parameters (`recipientUserId`, `senderName`, `category`)
that the edge function ignores — confusing call sites
(`app/play/page.tsx:761-767,798-804`).

### L10. `.single()` used where zero rows are expected
`app/challenge/[code]/page.tsx:57-63` calls `.single()` on an
auto-create-referral lookup that is usually empty, producing benign-but-noisy
errors. Use `.maybeSingle()` (as `setup-profile` correctly does).

### L11. Health check depends on table grants, not a policy
`app/api/health/route.ts:13-16` counts `waitlist` rows with the anon key. With
correct RLS the count would be 0; the endpoint would still report `"ok"`. Ping
a table designed for it (e.g. `select count head` on `sat_questions`) so the
health signal is meaningful.

---

## SUGGESTIONS (architecture, performance, testing, duplication)

### S1. `app/play/page.tsx` is a 1092-line monolith
One component handles solo, 1v1 challenge, group, and untimed modes with ~25
`useState`/`useRef` hooks and a 215-line gem-award effect (lines 597-812). The
project docs already acknowledge this. Extract per-mode logic into custom hooks
(`useSoloRound`, `useChallengeRound`, `useGroupRound`) and split the results
side-effects out of the render component.

### S2. No shared auth/user hook — heavy duplication
`createClient()` + `getSession()`/`getUser()` + the displayName fallback chain
(`meta?.display_name || meta?.full_name || meta?.name || email?.split("@")[0]`)
is reimplemented in at least 8 places: `header.tsx:34-38`,
`account/page.tsx:33-43`, `challenge-button.tsx:35-48`,
`results-screen.tsx:88-102`, `games-list.tsx:24-29,90-95`,
`group/[code]/page.tsx:53-69`, `play/page.tsx:33-52`,
`posthog-provider.tsx:36-62`. Build one `useUser()` context/hook and a
`getDisplayName(user)` util.

### S3. N+1 query in the games list
`components/rally/games-list.tsx:104-115` fires a separate `getH2HRecord`
request per completed challenge. A user with 20 games triggers ~20 round-trips.
Fetch all `head_to_head` rows for the user in one query and index them in a
map.

### S4. No automated tests anywhere
There is not a single test file. The highest-value, lowest-effort targets are
the pure functions in `lib/`: `gemsForAnswer` / `calculateRoundGems`
(`gem-context.ts`), `poolToFlat` / `poolFromFlat` (`challenges.ts` — the
flatten/reconstruct contract is load-bearing for every challenge),
`adjustSubtopicLevel` / `pickDifficultyForLevel` (`subtopic-levels.ts`),
challenge win/tie logic, and `scoreDiagnostic`. Add unit tests for these plus
RLS policy tests (Supabase supports `pgTAP`), and wire them into CI.

### S5. Inconsistent error-handling contracts
Across `lib/` some functions `throw` (`questions.ts:60,64`), some return `null`
(`getChallenge`), some return `false` (`completeChallenge`), some swallow
silently (`sync.ts`, `head-to-head.ts`). Callers handle each differently, so
the UX of "something went wrong" is inconsistent (sometimes a toast, sometimes
a full error screen, sometimes nothing). Pick one convention — e.g. a
`Result<T>`-style return — for data-layer functions.

### S6. Group page polls every 30s
`app/group/[code]/page.tsx:75-82` re-fetches the entire leaderboard on an
interval. Supabase Realtime subscriptions on `group_challenge_entries` would be
cheaper and instant.

### S7. Missing index on `challenges.share_code`
`share_code` is the lookup key for `getChallenge`, `complete_challenge`,
`updateCreatorResults`, and `cancelChallenge`, yet only `creator_id` /
`challenger_id` are indexed (migration `002:6-7`). Add a unique index on
`challenges.share_code`. (`group_challenges.code` is already indexed —
`017:30`.) Consider partial indexes for the frequent `status = 'completed'` /
`status = 'pending'` filters.

### S8. Untyped `jsonb` blobs trust their shape
`row.snapshot as ParentDashboardData` (`parent/[token]/page.tsx:47`),
`data as Challenge`, `data as Question`, `creator_results` etc. are cast
straight from `jsonb`. The app code is otherwise clean of `any` (good), but
these casts are where a bad/old row will silently produce `undefined` field
access. Validate `jsonb` payloads with `zod` (already a dependency) at the
boundary.

### S9. `DrawTab` keeps up to 20 full-canvas snapshots
`components/rally/work-area.tsx:421-428` stores up to 20 `ImageData` objects
(canvas is ~78vh at devicePixelRatio) for undo — several MB on a retina phone.
Cap lower or store compressed snapshots / a stroke list.

### S10. Canvas not resized after first mount
`work-area.tsx:381-408` sizes the draw canvas once in a `useEffect([])`. On
orientation change or any sheet resize the canvas geometry is stale. Add a
`ResizeObserver`.

### S11. `gemsForAnswer` silently falls back on bad input
`lib/gem-context.tsx:30-34` — `mode[difficulty] ?? mode.easy` means a malformed
`difficulty` string silently awards the *easy* value rather than failing
loudly. Fine if difficulty is always one of three literals; risky given
difficulty strings come from DB rows. Consider a typed union + assertion.

### S12. `images.unoptimized: true`
`next.config.mjs:9-11` disables Next image optimization globally. Acceptable
for the current static OG PNGs, but revisit before adding user-facing imagery.

---

## What the recent security work got right

For balance — these were reviewed and look sound:

- Migration `022` correctly removed the world-readable `push_subscriptions`
  policy, locked the `challenges` UPDATE policy with a `WITH CHECK` plus a
  field-protection trigger, added caller authorization to `upsert_h2h_record`,
  and closed the forgeable `group_challenge_entries` INSERT/UPDATE — and every
  function it defines pins `search_path`.
- The `send-push-notification` edge function authenticates the caller from
  their JWT, verifies challenge participation, and derives recipient + content
  + URL server-side — it cannot be used to spam arbitrary users or smuggle
  redirect URLs.
- `create-checkout-session` and `customer-portal` both verify
  `authUser.id === userId` before acting.
- The Stripe webhook verifies the signature before processing.
- Share codes use `crypto.getRandomValues` (`challenges.ts:5-10`), not
  `Math.random`.

The recurring theme to internalize: **`RLS USING (true)` is not "secret-token
access control."** If a table holds anything private, reads must be scoped by
`auth.uid()` or funneled through a `SECURITY DEFINER` RPC. C1 and C2 are the
same mistake `022` already fixed elsewhere — apply that fix consistently.
