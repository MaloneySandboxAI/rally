---
name: rally
description: |
  Lessons learned and architectural knowledge for the Rally SAT prep app. Use this skill whenever working on Rally codebase changes — features, bug fixes, or debugging. Trigger on any mention of Rally, the SAT prep app, quiz gameplay, challenges, gems, hearts, streaks, leaderboards, or any file in the rally project. This skill prevents repeating past mistakes and encodes hard-won knowledge about the app's architecture and gotchas.
---

# Rally App — Lessons & Architecture Guide

## Deployment & Environment

### Vercel + Next.js SSR Gotcha (Critical)
Next.js App Router with `"use client"` does NOT prevent server-side rendering. Components still prerender on the server during `next build`. Any code that runs at module level or during render (not inside useEffect/event handlers) will execute during SSR where browser APIs don't exist.

**The fix pattern — always guard browser APIs:**
```typescript
// BAD — breaks Vercel build
const value = localStorage.getItem("key")

// GOOD — safe for SSR
const value = typeof window !== "undefined" ? localStorage.getItem("key") : null
```

**Where this has bitten us:**
- `lib/premium-context.tsx` — `localStorage` accessed during render (line ~51) and inside useEffect without guard (line ~43). Caused ALL Vercel deploys to fail with `ReferenceError: localStorage is not defined` during prerendering of `/_not-found`.
- `components/rally/streak-banner.tsx` — `getValidStreak()` called from useState lazy initializer without a window guard.

**Rule:** Before adding any `localStorage`, `navigator`, `window`, or `document` call, check if it could run during SSR. If in doubt, wrap it.

### Environment Variable Naming
Next.js only exposes env vars to the browser if they start with `NEXT_PUBLIC_`. Server-only vars (like `STRIPE_SECRET_KEY`) should NOT have this prefix. Client-side vars MUST have it.

**Past mistake:** `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID` were used in client-side code (`app/upgrade/page.tsx`) but didn't have the `NEXT_PUBLIC_` prefix, so they were `undefined` in the browser. The "start free trial" button silently failed because `priceId` was undefined, the API returned an error, and the catch block only logged to console.

**Rules:**
- If a variable is read in any `"use client"` component → must be `NEXT_PUBLIC_*`
- If only used in API routes / server components → no prefix needed
- When adding Stripe/API keys to Vercel, double-check the prefix matches what the code expects
- Always add a user-visible error (toast) in catch blocks, not just console.error

### Deploy Workflow
The sandbox cannot reach npm or Supabase directly. All changes must be pushed from the user's local terminal:
```bash
cd ~/Desktop/rally && git add -A && git commit -m "msg" && git push origin main
```
Vercel auto-deploys from main. Deploys take ~1-2 minutes. If a deploy fails, ALL subsequent deploys will also fail until the error is fixed — check the Vercel dashboard build logs.

### Database Migrations
SQL migrations live in `supabase/migrations/`. They must be run manually in the Supabase SQL Editor (Dashboard → SQL Editor → paste → Run). "No rows returned" is the expected success output for DDL statements. Always remind the user to run new migrations.

## Game Economy

### Dual Currency System
The app has two currencies that serve different purposes:

- **Gems** (earned): Reward currency earned by answering correctly. Harder questions = more gems. Speed bonus (1.5x) for answering in under half the allotted time. Free users earn ~180+ gems/day (150 from questions + 30 login bonus, more with speed bonuses).
- **Hearts** (spent): Gating currency for solo play. Start with 5/day. Lose 1 per wrong answer (deducted at end of round, not mid-game). Run out = can't play until tomorrow.

**Gem spending:**
- Heart refill: 200 gems → restores 5 hearts
- Streak freeze: 150 gems → protects streak for 1 missed day (consumable, one-time use)
- Stats deep dive: 500 gems → one-time unlock for per-difficulty breakdowns, trend analysis, and insights on the progress page
- Daily login bonus: 30 gems (automatic)
- Streak milestones: 7 days = +100 gems, 30 days = +500 gems

**Free user limits (solo only, challenges bypass all):**
- ~180+ gems/day earning potential (more with speed bonuses)
- 5 hearts/day
- 3 rounds/day
- All reset at midnight local time

**Premium users:** Unlimited gems, no heart loss, no round limit.

### Gem Cap Enforcement
When free users hit the daily gem cap, play should be BLOCKED (not just earnings silently capped). The blocking screen shows a diamond icon and "unlock unlimited gems" upgrade button. Previously this was just a dismissable toast, which confused users who could keep playing but earn 0 gems while wasting hearts.

The cap is tracked via `dailyGemsCapped` from `usePremium()` context.

### Premium State
Premium status comes from two sources:
1. Supabase `subscription_status` (authoritative, server-side)
2. `localStorage.getItem("rally_is_pro")` (fast client-side cache)

The `PremiumProvider` checks localStorage first for instant UI, then loads from Supabase. Both must be SSR-guarded.

## Challenge System

### Flow
1. Creator picks category → `createChallenge()` creates DB row with 15 question IDs
2. Creator MUST share link via native share sheet before playing (no copy-link shortcut)
3. Creator plays their round → `updateCreatorResults()` saves score
4. Challenger opens link → `completeChallenge()` saves their results
5. Winner = higher total gems earned (not correct count — rewards harder difficulty)

### Question Pool Architecture
- 15 questions per challenge: 5 easy + 5 medium + 5 hard
- Stored as flat `integer[]` in DB column `question_ids`
- `poolToFlat(pool)` / `poolFromFlat(flat)` convert between structured `{easy, medium, hard}` and flat array
- Both players draw from the same pool via `drawFromPool()` based on adaptive difficulty
- Questions pre-fetched in one batch via `getQuestionsByIds()`

### Critical Bug Pattern: Challenge Mode Question Loading
In `app/play/page.tsx`, `fetchNextQuestion()` handles BOTH modes internally — it checks `challengePoolRef.current` and draws from pool for challenges, or fetches from Supabase for solo. The bug pattern is gating `fetchNextQuestion()` behind a mode check that excludes one player type:

```typescript
// BAD — skips fetchNextQuestion for challengers, causing spinner after Q1
if (!challengeCode) await fetchNextQuestion()

// GOOD — fetchNextQuestion handles both modes internally
await fetchNextQuestion()
```

This caused challengers to get stuck on a spinner after the first question because questions 2-5 were never loaded into `sessionQuestions`.

### Share Flow
`navigator.share()` is used on mobile. There's no way to distinguish "shared to an app" vs "copied from share sheet" — the API doesn't provide this info. Desktop fallback uses `mailto:`.

## Key Files & Their Responsibilities

| File | Purpose | Lines |
|------|---------|-------|
| `app/play/page.tsx` | Main gameplay (solo + challenge) | ~1700 |
| `app/challenge/[code]/page.tsx` | Challenge accept / results | |
| `app/upgrade/page.tsx` | Premium upgrade with Stripe checkout | |
| `app/store/page.tsx` | Gem store (heart refill, streak freeze) | |
| `app/stats/page.tsx` | Stats with per-category difficulty breakdown | |
| `app/ranks/page.tsx` | Leaderboard (podium + ranked list) | |
| `app/setup-profile/page.tsx` | Username creation post-signup | |
| `lib/premium-context.tsx` | Premium state provider (SSR-sensitive!) | |
| `lib/gem-context.tsx` | Gem balance, streak, freeze functions | |
| `lib/hearts.ts` | Hearts system, refill, solo play gating | |
| `lib/challenges.ts` | Challenge CRUD, pool helpers, leaderboard | |
| `lib/questions.ts` | Question fetching from Supabase | |
| `lib/stats.ts` | Stats tracking with difficulty breakdown | |
| `lib/subscription.ts` | Subscription/premium detection, daily cap | |
| `components/rally/challenge-button.tsx` | Challenge creation bottom sheet | |
| `components/rally/feedback-button.tsx` | Feedback UI → Supabase `feedback` table | |
| `components/rally/streak-banner.tsx` | Streak display + daily login claim | |
| `components/rally/games-list.tsx` | Active/completed challenge list | |

## Auth Flow
1. Login → Google OAuth or email magic link or guest
2. OAuth callback redirects to `/setup-profile` (username creation)
3. Then `/age-verify`
4. Then home page
5. `PUBLIC_PATHS` in `auth-gate.tsx` must include any pre-auth pages

Display name priority: `user_metadata.display_name` > `user_metadata.full_name` > `user_metadata.name` > email prefix > "anonymous"

## Design Principles
- **Mobile-first**: Minimize scrolling on iPhone. Use `h-[100dvh]` for full-screen layouts.
- **Color palette**: Dark navy `#021f3d`, accent blue `#378ADD`, gem gold `#EF9F27`, categories have individual colors.
- **Auto mode**: User prefers minimal back-and-forth. Make decisions and implement, ask only when genuinely ambiguous.
- **Error handling**: Always show user-visible errors (toasts), never just console.log. Silent failures are the #1 source of "nothing happens" bug reports.

## Supabase Tables
- `challenges` — challenge games (question_ids, scores, status, creator_id, challenger_id)
- `users` — user profiles (username, stripe_customer_id, referral_code, referred_by)
- `feedback` — user feedback from in-app button (reaction, message, page)
- `referrals` — referral tracking (referrer_id, referred_id, status, gems_awarded, completed_at)
- RLS is enabled; policies allow appropriate access patterns

## Referral System

### Flow
1. User taps "refer a friend" → `fetchMyReferralCode()` gets their unique 8-char code from Supabase
2. Native share sheet sends link: `rallyplaylive.com/join?ref=CODE`
3. Friend opens `/join?ref=CODE` → `storePendingReferral(code)` saves to localStorage
4. Friend signs up → `/setup-profile` calls `processPendingReferral()` which sets `referred_by` and creates a `referrals` row (status: pending)
5. Friend finishes first round → `completeReferralIfPending()` awards 500 gems to referred user, marks referral completed
6. Referrer gets 500 gems on next app load via `claimReferralBonuses()`

### Key Files
- `lib/referrals.ts` — all referral logic (code fetch, pending storage, processing, gem awards)
- `components/rally/referral-banner.tsx` — share button + referral stats panel
- `app/join/page.tsx` — landing page for referral links (stores code, routes to login)
- `supabase/migrations/004_referral_system.sql` — DB schema

### Architecture Notes
- Referral codes auto-generated by DB trigger on user insert (`generate_referral_code()`)
- Existing users backfilled with codes in migration
- Gems are localStorage-based, so referrer bonus uses a "claim on load" pattern: completed referrals are tracked in Supabase, referrer claims gems via `claimReferralBonuses()` which checks localStorage for already-claimed IDs
- `/join` is in `PUBLIC_PATHS` (no auth required)
- Self-referral is blocked

## Common Pitfalls to Avoid
1. **Don't access browser APIs during render** — always guard with `typeof window !== "undefined"`
2. **Don't use `NEXT_PUBLIC_` prefix for server-only secrets** — and vice versa
3. **Don't gate `fetchNextQuestion()` by player type** — it handles both modes internally
4. **Don't rely on toast-only notifications for blocking states** — users dismiss them and get confused
5. **Don't forget to remind user about SQL migrations** — they must be run manually in Supabase
6. **Don't add pages without updating `PUBLIC_PATHS`** if they need to be accessible pre-auth
7. **Hearts are deducted at end of round, not per-question** — this is intentional to avoid mid-game frustration
8. **Challenge mode bypasses all solo limits** — hearts, round cap, and gem cap don't apply
