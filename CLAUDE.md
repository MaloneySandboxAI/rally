# Rally - SAT & AP Prep App

## Overview
Rally is a mobile-first SAT & AP prep quiz app with solo play, head-to-head challenges, group challenges, and untimed practice modes. Built with Next.js (App Router), TypeScript, Supabase (PostgreSQL + Auth), hosted on Vercel (auto-deploys on push to main).

## Tech Stack
- **Framework**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Row-Level Security)
- **Auth**: Supabase Auth (Google OAuth, email magic link, guest play)
- **Hosting**: Vercel Hobby plan (auto-deploy from `main` branch)
- **Analytics**: PostHog (person profiles, event tracking)
- **Payments**: Stripe (subscription upgrades)
- **GitHub**: MaloneySandboxAI account
- **Domain**: rallyplaylive.com
- **Calculator**: MathLive + math.js + function-plot (open-source, no recurring cost)
- **Build tool**: Conductor (AI code agent) for feature builds; Cowork for planning, reviews, fixes

## Key Architecture

### Categories
Defined in `lib/categories.ts` with `isMath` flag:
- **Math** (isMath: true): Algebra, Data & Statistics, AP Pre Calculus
- **Non-math** (isMath: false): Reading Comprehension, Grammar, AP Biology, AP US History, AP English Language

### Gem Economy
- Solo timed rates: Easy 10, Medium 20, Hard 40
- Challenge rates: Easy 40, Medium 80, Hard 160 (4x multiplier)
- Speed bonus: 1.5x for fast answers (timed only — no speed bonus in untimed)
- Untimed practice: same as solo timed rates (Easy 10, Medium 20, Hard 40); daily gem cap still applies for free users

### Challenge System
- **Flow**: Creator picks category -> shares link -> THEN plays their round (link must be shared before play unlocks)
- **Scoring**: Winner determined by total gems earned (not correct count) — rewards harder difficulty
- **Shared question pool**: 15 questions per challenge (5 easy + 5 medium + 5 hard), stored as flat `integer[]` in DB
- **Adaptive difficulty**: Both players start easy, bump up on correct, drop on wrong, drawing from the same pool
- **DB sentinel**: `creator_score = -1` means creator hasn't played yet; `status` is 'pending' or 'completed'
- **H2H records**: `head_to_head_records` table tracks win/loss/draw between player pairs, deduplicated by sorted user IDs
- **Share cards**: Screenshot-friendly result cards with gradient backgrounds, rendered via canvas

### Group/Classroom Challenges
- Teacher or student creates a group challenge with a shareable code
- Multiple participants join and compete on the same question pool
- Leaderboard shows all participants ranked by gems earned
- Route: `app/group/[code]/page.tsx`
- Logic: `lib/group-challenges.ts`

### Question Pool Storage
- `question_ids` column is `integer[]` (NOT jsonb)
- `poolToFlat(pool)`: flattens `{easy, medium, hard}` to `[...easy, ...medium, ...hard]`
- `poolFromFlat(flat)`: reconstructs by slicing at indices 0-5, 5-10, 10-15

### Question history — per-user, persistent
Logged-in users have their seen questions tracked in `user_question_history` (Supabase). The picker (`getOneQuestion` in `lib/questions.ts`) excludes any IDs that appear in this table for the current user + category. When a user has seen every question in a category, both the in-memory `sessionUsedIds` and the DB history are reset and a toast tells them they're starting fresh. Guest (unauthenticated) users keep the session-only behavior they had before. Challenge mode is unaffected — challenges share a pre-built question pool by design.

### Timer System (category-aware)
- Math categories: Easy 45s, Medium 75s, Hard 120s
- Reading categories: Easy 35s, Medium 55s, Hard 90s
- Untimed practice mode: no timer, endless 1-at-a-time questions

### Untimed Practice Mode
- Toggle on skills page subtopic tap
- URL param: `&untimed=true` on `/play`
- No timer, no hearts/lives, no speed bonus; earns gems at solo rate (same as timed)
- Endless play — user taps "done" in header when finished
- Full explanation shown after each answer (not line-clamped)
- Stats, subtopic levels, streaks, and gems all adjust on round completion; daily gem cap applies for free users
- Gem-earned summary card shown on results screen with breakdown by difficulty

### Calculator Integration
- Component: `components/rally/free-calculator.tsx` (MathLive + math.js + function-plot — MIT/Apache 2.0)
- WorkArea (`components/rally/work-area.tsx`) conditionally renders FreeCalculator for math categories, basic calculator for non-math
- `isMath` prop passed from play page based on category config
- Libraries loaded dynamically (only when Calculator tab opens) — ~1.5MB, doesn't touch main bundle
- Inline scalar evaluation: type `3+4*2` → shows `= 11`; type expressions with `x` to plot them

### Push Notifications
- Service worker registration in app
- `lib/push-notifications.ts` handles subscription and delivery
- `lib/challenge-notify.ts` sends notifications when opponent completes a challenge
- Supabase stores push subscriptions

### Referral System
- Referral codes linked to users
- Bonus gems for successful referrals via challenge links
- RLS policies on referral tables

### Weekly Recap
- `lib/weekly-recap.ts` computes weekly stats (who you played, record, best win)
- `components/rally/weekly-recap-card.tsx` renders the recap

### Friends / Recent Opponents
- `components/rally/recent-opponents.tsx` shows recent opponents with quick-challenge shortcut

### Stale Challenge Cleanup
- Pending challenges older than 7 days show as "expired" in games list
- Creator can delete individually (X button) or batch delete all expired

### Analytics
- PostHog for analytics, person profiles via `posthog.identify()` in `lib/posthog-provider.tsx`
- Internal user filtering: cohort excludes @evaine.ai and ctgmaloney@gmail.com

### Premium / Subscriptions
- Stripe integration for upgrades
- `lib/subscription.ts` and `lib/premium-context.tsx` manage premium state
- `app/upgrade/page.tsx` and `app/upgrade/success/page.tsx` for upgrade flow

### iOS native platform — upgrade UI hidden
The iOS app (Capacitor WebView, loads the live site via `capacitor.config.ts`) hides all entry points to `/upgrade` to comply with Apple Guideline 3.1.1 (digital subscriptions require Apple IAP, not Stripe). Detection uses `useIsNativeIOS()` in `lib/use-platform.ts`, which reads `window.Capacitor` directly (no `@capacitor/core` dependency, SSR-safe, defaults to `false`). Web and Android keep the existing Stripe flow unchanged.

Entry points gated on iOS native:
- `app/play/page.tsx` — gem-cap toasts (timed + untimed) drop the "unlock" action and just say "come back tomorrow"; the `soloBlocked` gem-cap screen drops the "unlock unlimited gems" button (hearts refill, which costs gems not money, still works).
- `components/rally/header.tsx` — daily gem-cap indicator renders as a plain `<span>` instead of a `/upgrade` link.
- `app/account/page.tsx` — free users see neither the "Upgrade to Premium" card nor the locked "Parent Progress Report" upsell; premium users keep "Manage Subscription" (account management, not a purchase).
- `components/rally/challenge-button.tsx` — hitting the free-challenge limit shows an informational toast instead of redirecting to `/upgrade`; button label/subtext avoid "upgrade"/"premium" wording.
- `app/upgrade/page.tsx` — if reached via a deep link on iOS, redirects to `/home` (and renders a spinner, never flashing the Stripe UI).

Note: `components/rally/pro-banner.tsx` shows pricing but is dead code (imported nowhere), so it never surfaces on iOS. The `usePremium` gating itself is unchanged — only the upsell prompts are hidden.

v1.1 plan: replace the hidden UI with native StoreKit IAP via a Capacitor plugin so iOS users can subscribe in-app, then restore the upgrade UI routed through IAP instead of Stripe.

### Session storage — cookie-based (not localStorage)
The Supabase browser client stores the session in a first-party cookie (`sb-*`), not localStorage. This survives Safari ITP's 7-day idle purge, which was causing students to re-log in every time they clicked a new challenge link from iMessage. Cookie config: `Max-Age=30 days`, `SameSite=Lax`, `Secure`.

The companion fix (iOS Universal Links so iMessage opens the Rally app directly instead of Safari) is implemented — see "iOS Universal Links" below.

### Sign in with Apple
Rally supports Sign in with Apple via `lib/auth-apple.ts` (`signInWithApple(redirectTo?)`), wired into the "Continue with Apple" button at the top of `app/login/page.tsx` (above Google — Apple's iOS convention). On iOS native (Capacitor) it invokes the native Face ID / Touch ID sheet, then hands the returned identity token to Supabase via `signInWithIdToken({ provider: "apple" })` — no browser redirect. On web and Android it falls back to Supabase's standard `signInWithOAuth({ provider: "apple" })` redirect flow.

Like the rest of the codebase, the helper reaches the native plugin through the global `window.Capacitor.Plugins.SignInWithApple` bridge rather than importing `@capacitor-community/apple-sign-in` / `@capacitor/core` (matches `lib/use-platform.ts` and `lib/capacitor-deep-links.ts`) — so the web bundle has no hard Capacitor dependency and the web build needs no npm install. The native iOS project still needs the plugin: `pnpm add @capacitor-community/apple-sign-in` then `npx cap sync ios` (on the user's Mac), which registers the bridge.

Configured providers in Supabase (Authentication → Providers → Apple):
- Client IDs: `com.rallyplaylive.web,com.rallyplaylive.app` (Services ID for web, Bundle ID for native)
- Secret Key: 180-day JWT signed with the .p8 key (Key ID `866P6U22N8`, Team ID `U9VU383K79`) from the Apple Developer Portal — regenerate every ~180 days (calendar reminder for end of November 2026) with `~/Documents/Rally/generate-apple-jwt.mjs` and paste into Supabase before web sign-in breaks.

Apple Guideline 4.8: required because Rally offers Google OAuth.

### iOS Universal Links — open challenge links in the app
So iMessage challenge links open the native Rally app (where the student is already authenticated) instead of a fresh Safari context, the app serves an Apple App Site Association (AASA) file and the native shell routes incoming links to the matching in-app page.

- **AASA route**: `app/.well-known/apple-app-site-association/route.ts` serves the AASA JSON with `Content-Type: application/json`. It reads `process.env.APPLE_TEAM_ID` at request time (`dynamic = "force-dynamic"`) and pairs it with the bundle ID `com.rallyplaylive.app`. Linked paths: `/challenge/*`, `/group/*`, `/c/*`, `/g/*`, `/join`, `/home`.
- **Deep-link handler**: `lib/capacitor-deep-links.ts` (`initDeepLinks()`) listens for Capacitor's `appUrlOpen` event and `window.location.replace()`s to `pathname + search` for `*.rallyplaylive.com` URLs so the auth gate runs on the destination. It reaches the App plugin via the global `window.Capacitor.Plugins.App` bridge rather than importing `@capacitor/app`/`@capacitor/core` — same no-hard-dependency, SSR-safe pattern as `lib/use-platform.ts`, so nothing is added to the web bundle and no npm install is needed for the web build. `components/rally/deep-link-init.tsx` (`<DeepLinkInit />`, mounted in `app/layout.tsx`) calls it once on mount; it's a no-op outside the native iOS shell.

**Manual steps required (one-time, outside this repo):**
1. **Apple Team ID** — from developer.apple.com → Membership Details (10-char alphanumeric). _(Already set in Vercel for this project per the build instructions.)_
2. **Vercel env** — add `APPLE_TEAM_ID=XXXXXXXXXX` for Production + Preview, then redeploy so the AASA route serves the real value (not `REPLACE_WITH_TEAM_ID`).
3. **Native iOS project** — install the App plugin so `appUrlOpen` fires: `pnpm add @capacitor/app` then `npx cap sync ios` (run on the user's Mac; the sandbox can't reach npm).
4. **Xcode** — `npx cap open ios`, select the Rally target → Signing & Capabilities → "+ Capability" → **Associated Domains**, add `applinks:www.rallyplaylive.com` and `applinks:rallyplaylive.com`. Confirm the Team is selected under Signing.
5. **Verify** — visit `https://www.rallyplaylive.com/.well-known/apple-app-site-association` (should return JSON with the real team + bundle ID), validate at `https://search.developer.apple.com/appsearch-validation-tool/`, then test on a **physical device** (Universal Links don't work in the simulator from iMessage): send a challenge link via iMessage from another phone, tap it → opens the Rally app at `/challenge/CODE`, already logged in.

### Reviewer bypass (App Store submission only)
`app/auth/reviewer/route.ts` accepts `?token=XXX` and signs the browser in as `reviewer@rallyplaylive.com` if the token matches `REVIEWER_BYPASS_TOKEN`. Used solely for Apple's App Store reviewer who cannot receive magic link emails. The route returns 404 if the env var is missing, so removing the env var from Vercel disables the bypass cleanly without a code change. Remove after v1 is approved.

## App Routes
| Route | Purpose |
|-------|---------|
| `/` (app/page.tsx) | Marketing landing page (redirects logged-in users to /home) |
| `/login` | Auth page (Google OAuth, email magic link, guest play) |
| `/home` | Main dashboard — category rings, challenge banner, games list |
| `/skills` | Subtopic list per category, mode selection (timed vs untimed) |
| `/play` | Main gameplay (~1900 lines) — solo + challenge + untimed modes |
| `/games` | Full games list |
| `/ranks` | Leaderboard / rankings |
| `/account` | User profile and settings |
| `/challenge/[code]` | Challenge accept / results page |
| `/group/[code]` | Group challenge page |
| `/diagnostic` | Diagnostic quiz |
| `/upgrade` | Stripe subscription upgrade |
| `/join` | Referral join flow |
| `/ap` | AP subject selection |
| `/age-verify` | COPPA age verification |
| `/setup-profile` | New user profile setup |
| `/parent/[token]` | Parent dashboard |

## Key Files

### Pages
- `app/page.tsx` — Marketing landing page with auth redirect
- `app/play/page.tsx` — Main gameplay (~1900 lines), handles solo + challenge + untimed modes
- `app/home/page.tsx` — Home page layout
- `app/skills/page.tsx` — Subtopic list per category, mode selection bottom sheet
- `app/challenge/[code]/page.tsx` — Challenge accept / results page
- `app/group/[code]/page.tsx` — Group challenge page
- `app/login/page.tsx` — Authentication page

### Components (components/rally/)
- `work-area.tsx` — Bottom sheet with tabs: Notepad, Calculator (FreeCalculator for math), Draw
- `free-calculator.tsx` — Open-source graphing calculator (MathLive + math.js + function-plot)
- `challenge-button.tsx` — Challenge creation UI, gates play behind link share
- `games-list.tsx` — Active games list with expired challenge management
- `category-rings.tsx` — Home page category selection
- `bottom-nav.tsx` — Bottom navigation bar
- `auth-gate.tsx` — Auth wrapper component
- `header.tsx` — App header
- `results-screen.tsx` — Post-game results
- `challenge-share-card.tsx` — Screenshot-friendly challenge result card
- `share-challenge-result-button.tsx` — Share button for results
- `rematch-button.tsx` — Rematch after challenge
- `weekly-recap-card.tsx` — Weekly stats recap
- `recent-opponents.tsx` — Friends/recent opponents list
- `referral-banner.tsx` — Referral promotion
- `push-prompt.tsx` — Push notification opt-in
- `streak-banner.tsx` / `streak-celebration.tsx` — Streak tracking UI
- `math-text.tsx` — Math formatting (exponents, no-wrap equations)
- `countdown-timer.tsx` — Game timer
- `answer-option.tsx` — Answer choice button
- `diagnostic-card.tsx` — Diagnostic quiz card
- `calculator.tsx` — Basic calculator (non-math categories)

### Library (lib/)
- `categories.ts` — Category definitions with isMath flag
- `challenges.ts` — Challenge CRUD, pool flatten/unflatten, stale detection
- `questions.ts` — Question fetching, getChallengePool(), getOneQuestion()
- `group-challenges.ts` — Group challenge logic
- `head-to-head.ts` — H2H record tracking
- `weekly-recap.ts` — Weekly stats computation
- `push-notifications.ts` — Push notification management
- `challenge-notify.ts` — Challenge completion notifications
- `subtopic-levels.ts` — Subtopic mastery levels
- `stats.ts` — User statistics
- `hearts.ts` — Lives/hearts system
- `explanations.ts` — Answer explanations
- `subscription.ts` — Stripe subscription management
- `access.ts` — Access control
- `diagnostic.ts` — Diagnostic quiz logic
- `haptics.ts` — Haptic feedback
- `utils.ts` — General utilities
- `supabase/client.ts` — Supabase browser client
- `supabase/server.ts` — Supabase server client
- `gem-context.tsx` — Gem economy React context
- `premium-context.tsx` — Premium status context
- `posthog-provider.tsx` — PostHog analytics provider
- `question-tracker-context.tsx` — Question tracking context

## Design Conventions
- **Mobile-first**: All layouts optimized for iPhone, minimize scrolling
- **Dark theme**: Navy background (#021f3d), blue accents (#378ADD), light blue text (#85B7EB)
- **Category colors**: Algebra #378ADD, Reading #14B8A6, Grammar #A855F7, Data #F97316, AP Bio #22C55E, AP Pre Calc #EC4899, APUSH #F59E0B, AP English #6366F1
- **Font weights**: Use font-extrabold for headings, font-bold for labels
- **Rounded corners**: rounded-xl for cards, rounded-2xl for larger containers
- **Bottom sheets**: Used for mode selection, work area, challenges
- **WorkArea z-index**: z-50 for the bottom sheet overlay

## Development Workflow
- Sandbox cannot reach npm registry or Supabase directly — can only edit files
- User pushes from local terminal: `cd ~/Desktop/rally && git add -A && git commit -m "msg" && git push origin main`
- Vercel auto-deploys on push to main (typically ~30-35s build time)
- `next.config.mjs` has `ignoreBuildErrors: true` — type errors don't block deploys
- Feature builds done via Conductor (AI agent) using detailed prompts
- Code reviews and fixes done in Cowork sessions
- User prefers "auto mode" with minimal back-and-forth
- **IMPORTANT**: At the end of every session, proactively offer to run the `session-wrapup` skill to update CLAUDE.md and PROJECT-STATUS.md with what was accomplished. Also run it after any Conductor build is pushed. This keeps the docs accurate across sessions and devices.

## Recently Completed (May 29, 2026)
- [x] Replaced Desmos with open-source calculator stack (MathLive + math.js + function-plot) — eliminates $100/mo recurring cost
### Database Migrations
- No Supabase CLI is configured. Migrations under `supabase/migrations/` are applied **manually** by pasting the SQL into the Supabase dashboard SQL Editor. The folder is a git-tracked history of what's been run, not an automated pipeline.
- Apply migrations in filename order. After running a migration in the dashboard, the corresponding `.sql` file is what records "this ran" — don't skip committing it.
- **Production DB can drift from the file history.** Some migrations on disk are already applied in prod (e.g. policies created by an earlier commit), and some features in the file history were never deployed against prod (e.g. `parent_tokens` from 008). Before running anything, check whether the target objects already exist.
- **All new migrations must be idempotent.** Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and the `DROP POLICY IF EXISTS` → `CREATE POLICY` pattern (Postgres has no `CREATE POLICY IF NOT EXISTS`). Wrap conditional logic in `DO $$ ... $$` blocks. This makes re-runs safe when prod is already partially in sync.

## Question Distractor Improvement Pipeline (agent-driven, no API cost)

Rewrites wrong-answer choices to match real SAT distractor logic. Full spec: `/Users/colleenmaloney/Documents/Rally/answer-improvement-prompt.md`.

### One-time setup
1. Run `supabase/migrations/025_question_improvement_v2.sql` in the Supabase SQL editor.
2. `pnpm install` (adds `tsx` and `dotenv` dev deps).
3. Confirm `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`.

### Process
1. In Conductor, start an agent in the `rally` repo.
2. Agent loops: `pnpm tsx scripts/q-fetch.ts --batch 50 --category Algebra` → reason → write to `scripts/.batch-pending.json` → `pnpm tsx scripts/q-write.ts scripts/.batch-pending.json`.
3. Spot-check `improvement_v2` in Supabase as it processes.
4. `pnpm tsx scripts/q-promote.ts --category Algebra --dry-run` then drop `--dry-run` to promote.
5. Repeat for Data & Stats and AP Pre Calc.

### Cost
Zero metered cost. Agent reasoning uses Claude Pro/Max subscription.

### Scripts
- `scripts/q-fetch.ts` — pulls next batch of unprocessed math questions (writes JSON to stdout)
- `scripts/q-write.ts <file>` — writes improvements from a JSON file into `improvement_v2` column
- `scripts/q-promote.ts [--category X] [--dry-run]` — promotes staged improvements → live columns

## Pending / Roadmap
- [ ] Desmos API: obtain production API key (partnership email sent May 26, 2026 — awaiting reply; currently using demo key)
- [ ] Decide on parent dashboard: either run migration 008 to create `parent_tokens` table (the `/parent/[token]` route is shipped in code but non-functional in prod), or remove the route from the app
- [ ] iOS App Store launch — execute `APP-STORE-LAUNCH-PLAN.md` (Capacitor wrap of the live Next.js site → TestFlight → submit). Done in Cowork. Guideline 3.1.1 (Stripe vs Apple IAP) handled for v1 by hiding upgrade UI on iOS (see "iOS native platform — upgrade UI hidden"). Remaining risks: Google OAuth in webview, Sign in with Apple.
- [x] iOS Universal Links — web side implemented (AASA route + Capacitor deep-link handler); see "iOS Universal Links" section. Remaining: manual native steps (set `APPLE_TEAM_ID` is done in Vercel; `pnpm add @capacitor/app` + `npx cap sync ios`; Xcode Associated Domains; physical-device test)

## App Store Launch (June 26, 2026)
- **Approach:** wrap the existing Next.js app in a **Capacitor** native iOS shell loading the live site (`https://rallyplaylive.com`). **No Flutter rebuild.** FoxDog was used **only** for the legal/account foundation and is scoped out of the build (its Flutter scaffold/ship pipeline doesn't apply to Next.js).
- **Legal/account foundation (complete via FoxDog):** LLC formed, registered agent, EIN, DUNS, Apple Developer enrollment, store account.
- **Full plan + Cowork handoff:** see `APP-STORE-LAUNCH-PLAN.md` at repo root.

## Recently Completed (June 26, 2026)
- [x] iOS Universal Links (web side) — AASA file served at `app/.well-known/apple-app-site-association/route.ts` (keyed off `APPLE_TEAM_ID` + bundle `com.rallyplaylive.app`), Capacitor `appUrlOpen` deep-link handler in `lib/capacitor-deep-links.ts` via the `window.Capacitor` bridge (no `@capacitor/app` web import — matches `lib/use-platform.ts` pattern), wired into `app/layout.tsx` through `components/rally/deep-link-init.tsx`. Branch `MaloneySandboxAI/universal-links`, not yet pushed/merged. Part 2 (cookie session) was already live on main. Remaining = native-project manual steps (see "iOS Universal Links").
- [x] Apple Guideline 3.1.1 compliance — hide all Stripe upgrade UI on iOS native via `useIsNativeIOS()` (`lib/use-platform.ts`); see "iOS native platform — upgrade UI hidden" for the full list of gated entry points (PR #7, live on prod). Verified hiding logic in-browser with a simulated `window.Capacitor`, then removed the temporary `?fakeios` QA toggle (PR #8). Web/Android unchanged. Still TODO: final check on a real device via TestFlight.

## Recently Completed (May 29, 2026)
- [x] Reconciled DB ↔ migration-file drift — verified migrations 022, 023 applied; 024 unnecessary (waitlist already locked, `parent_tokens` doesn't exist)
- [x] Pushed 3 backlogged commits to `origin/main` (H3/M4/M10 polish, waitlist+parent_tokens RLS, merge) — Vercel auto-deployed
- [x] Removed duplicate `024_*.sql` file from repo root (was identical to the one in `supabase/migrations/`)
- [x] Documented manual migration workflow + idempotency requirement in CLAUDE.md (this section's parent doc)

## Recently Completed (May 26, 2026)
- [x] Landing page pushed to production (live at rallyplaylive.com with full OG/Twitter meta)
- [x] Untimed gem economy unified — gem-earned card now shown on results screen for untimed sessions (commit c3dc1b4)
- [x] v0 Premium subscription canceled

<!-- FOXDOG:START -->
## FoxDog — get this app live on the App Store & Google Play

FoxDog is connected to you via the `foxdog` MCP server. The user built this app and wants your
help getting it live in the stores. They are likely **non-technical and new to the app-store
process** — explain things simply, be reassuring, and check with them before each step.

Start by calling the **`foxdog_start`** MCP tool, then do exactly what it returns, one step at a
time (advance with `foxdog_next`). FoxDog gives you the precise next action, the command to run,
and how to confirm it worked. Use `foxdog_doctor` to verify the local setup. Never ask the user
to send FoxDog any signing keys or store credentials — those stay on their machine.

Docs: https://foxdog.ai/docs
<!-- FOXDOG:END -->
