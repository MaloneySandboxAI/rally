# Rally Project Status & Roadmap

*Last updated: June 28, 2026 (Gameplay fixes — timeout auto-skip + gem-display copy)*

## Completed Features

### Core App (Shipped)
- [x] Solo timed play with adaptive difficulty
- [x] Head-to-head challenge mode (link-based invites)
- [x] Untimed practice mode (endless, full explanations)
- [x] 8 categories: Algebra, Reading, Grammar, Data & Stats, AP Bio, AP Pre Calc, APUSH, AP English
- [x] Gem economy with difficulty-based rewards and speed bonuses
- [x] Category rings on home page
- [x] Skills page with subtopic levels
- [x] Bottom navigation bar across all pages
- [x] WorkArea bottom sheet (Notepad, Calculator, Draw tabs)
- [x] Math text formatting (exponents, no-wrap equations)
- [x] Countdown timer (category-aware durations)
- [x] Stale challenge cleanup (7-day expiry, batch delete)

### Auth & Accounts
- [x] Google OAuth login
- [x] Email magic link login
- [x] Sign in with Apple (native iOS Face ID/Touch ID sheet + web OAuth fallback) — Guideline 4.8 (required since Google OAuth is offered)
- [x] Guest play mode
- [x] Age verification (COPPA)
- [x] Profile setup flow
- [x] **Account deletion (Apple Guideline 5.1.1(v))** — `POST /api/account/delete` hard-deletes the caller's `auth.users` row (service role), explicitly cleaning up every referencing table first so NO ACTION foreign keys can't block the delete; client clears all `rally_*` localStorage. Key gotcha: creator challenges must be DELETED (not nulled) because the `challenges_protect_fields` BEFORE UPDATE trigger blocks the service role. PRs #13 + #14, live on prod.
- [ ] Parent dashboard — route `/parent/[token]` shipped in code, but `parent_tokens` table never created in prod (migration 008 not applied). Non-functional until either migration runs or route is removed.

### Social & Competition
- [x] Challenge share cards (screenshot-friendly, canvas-rendered)
- [x] Rematch button on results
- [x] Head-to-head record tracking (win/loss/draw)
- [x] Challenge streak tracker between player pairs
- [x] Weekly recap (who you played, record, best win)
- [x] Friends list / recent opponents with quick-challenge
- [x] Group/classroom challenge mode
- [x] Referral reward boost for challenge invites
- [x] Leaderboards / rankings page

### Notifications
- [x] Push notifications when opponent completes challenge
- [x] Service worker + Supabase push subscription storage

### Calculator
- [x] Open-source graphing calculator (MathLive + math.js + function-plot — MIT/Apache 2.0, no recurring cost)
- [x] Inline scalar evaluation (e.g. `3+4*2 = 11`)
- [x] 2D function plotting for expressions with `x`
- [x] Basic calculator for non-math categories
- [x] Auto-resize on tab switch

### Infrastructure
- [x] PostHog analytics with user identification
- [x] Stripe subscription integration
- [x] Vercel auto-deploy from main branch
- [x] Marketing landing page (polished, multi-section)

### Bug Fixes & QA (May 2026)
- [x] H2H record inflation guard (prevent double-counting)
- [x] Share card bugs (hardcoded /5, transparent bg, duplicated code)
- [x] Referral RLS policies + challenge link tracking
- [x] Push notification delivery pipeline
- [x] Google login on Safari/iPhone
- [x] Database error on email signup
- [x] Guest mode 404 and broken flows
- [x] Challenge showing score instead of accept screen

### Bug Fixes & QA (June 28, 2026)
- [x] **Phantom timeout auto-skipping the next question** (commit `25bf1fa`, live on prod) — when a question's timer hit 0, the next question loaded then *instantly* auto-failed itself and skipped ahead (console showed two back-to-back "Next question" fetches with no input). Root cause: the time-up effect fires on `timeRemaining===0 && selectedAnswer===null`, and right after an auto-advance the new question briefly inherited the stale `timeRemaining===0` before the (later-defined) reset-timer effect re-initialized the clock. Fix: gate the time-up effect on `isTimerActive` and set `isTimerActive=false` during the swap in `advanceToNextQuestion()`.
- [x] **Timeout transition double-render** (commit `2c3937a`, live on prod) — hardened the question swap: `advanceToNextQuestion()` holds the `isLoadingNext` spinner across the entire swap (fetch + increment + answer reset) as one batched commit, so no frame can paint the next question while the timed-out answer reveal is still showing. Fixes the unmasked transition that was visible in challenge/group (pool) mode.
- [x] **Gem milestone copy** (commit `2c3937a`, live on prod) — the big end-of-round `GemMilestoneCelebration` overlay (fires when crossing a *lifetime* total like 500) now reads "N total gems!" / "you've reached…" instead of "gems earned!", so it isn't misread as this round's earnings. Per-question gem popups and the daily-cap math were left unchanged (they're correct).

### App Store Launch — Legal/Account Foundation (June 26, 2026)
- [x] Legal entity / LLC formed, registered agent address on file, EIN + DUNS obtained (via FoxDog)
- [x] Apple Developer Program enrollment + store account setup complete
- [x] Decided packaging approach: **Capacitor native shell loading live site** (not Flutter, not static export)
- [x] Scoped FoxDog out beyond legal/accounts — its Flutter pipeline doesn't apply to Rally's Next.js stack
- [x] Wrote `APP-STORE-LAUNCH-PLAN.md` (Cowork handoff doc — full Capacitor plan, listing checklist, risk flags)

### App Store Launch — iOS Build Prep (June 26, 2026)
- [x] **Apple Guideline 3.1.1 compliance** — hide all Stripe upgrade UI on iOS native (PR #7, live on prod). New `lib/use-platform.ts` `useIsNativeIOS()` hook (reads `window.Capacitor`, SSR-safe, defaults false). Gated entry points: gem-cap toasts + soloBlocked screen (`app/play/page.tsx`), header gem indicator (`components/rally/header.tsx`), account upgrade + parent-report cards (`app/account/page.tsx`), challenge-limit redirect (`components/rally/challenge-button.tsx`), and `/upgrade` deep-link redirect. Web/Android unchanged — gate can't trigger in a browser.
- [x] Verified the hiding logic in-browser via simulated `window.Capacitor` (cards confirmed hidden); removed the temporary `?fakeios` QA toggle afterward (PR #8)
- [ ] **Final verification on real iOS device via TestFlight** — only place `window.Capacitor` is genuinely "ios"; confirm no upgrade prompts surface anywhere in the app
- [x] **iOS Universal Links (web side)** — challenge/group/referral links open the app instead of a fresh Safari context. AASA file served at `app/.well-known/apple-app-site-association/route.ts` (reads `APPLE_TEAM_ID`, bundle `com.rallyplaylive.app`; linked paths `/challenge/*`, `/group/*`, `/c/*`, `/g/*`, `/join`, `/home`). Capacitor `appUrlOpen` handler in `lib/capacitor-deep-links.ts` via the `window.Capacitor` bridge (no `@capacitor/app` web import — same pattern as `useIsNativeIOS`), mounted through `components/rally/deep-link-init.tsx` in `app/layout.tsx`. Companion cookie-session fix (Part 2) was already live on main. Branch `MaloneySandboxAI/universal-links`, **not yet pushed/merged.**
- [ ] **iOS Universal Links — native steps** (manual, on user's Mac): `APPLE_TEAM_ID` set in Vercel ✓; still need `pnpm add @capacitor/app` + `npx cap sync ios`, Xcode → Associated Domains (`applinks:www.rallyplaylive.com`, `applinks:rallyplaylive.com`), and a physical-device iMessage test
- [x] **Sign in with Apple (web side)** — `lib/auth-apple.ts` `signInWithApple(redirectTo?)`: native iOS uses the Face ID/Touch ID sheet via `window.Capacitor.Plugins.SignInWithApple` bridge → `supabase.auth.signInWithIdToken`; web/Android fall back to `signInWithOAuth({ provider: "apple" })`. "Continue with Apple" button added above Google in `app/login/page.tsx`. No `@capacitor/core`/plugin web import (matches `useIsNativeIOS` pattern), so web build needs no npm install. Supabase Apple provider + Apple Services ID/Bundle ID/.p8 JWT already configured. Committed on branch `MaloneySandboxAI/algiers`, **not yet pushed/merged.**
- [ ] **Sign in with Apple — native steps** (manual, on user's Mac): `pnpm add @capacitor-community/apple-sign-in` + `npx cap sync ios` (registers the native bridge); TestFlight test of the native sheet. If native token exchange errors, add a matching `nonce` to `authorize()` (omitted for now to match the spec; untestable until TestFlight). Rotate the Supabase Apple secret JWT (~180 days, ≈ end of Nov 2026) via `~/Documents/Rally/generate-apple-jwt.mjs`.

### Database & Migrations (May 29, 2026)
- [x] Reconciled DB ↔ migration file drift — verified 022 (`guest_sessions`, public challenge read) and 023 (challenge delete policies) applied; 024 confirmed unnecessary in prod (waitlist already locked, `parent_tokens` doesn't exist)
- [x] Pushed 3 backlogged commits to `origin/main` (H3/M4/M10 polish + waitlist/parent_tokens RLS migration + merge)
- [x] Deleted stray duplicate `024_*.sql` from repo root
- [x] Added "Database Migrations" section to CLAUDE.md documenting manual-apply workflow, drift reality, and idempotency requirement for new migrations

---

## In Progress / Pending

### Immediate (This Sprint)
- [ ] **iOS App Store launch** — execute `APP-STORE-LAUNCH-PLAN.md` in Cowork: Capacitor wrap → TestFlight → submit. Guideline 3.1.1 (Stripe-vs-Apple-IAP) mitigated for v1 by hiding upgrade UI on iOS (see App Store Launch — iOS Build Prep); Guideline 4.8 (Sign in with Apple) now satisfied (web side built — see iOS Build Prep); Guideline 5.1.1(v) (account deletion) now satisfied (see Auth & Accounts), verified deleting a live account on-device. Remaining risk: Google OAuth in webview. v1.1: native StoreKit IAP, then restore upgrade UI routed through IAP.
- [x] ~~iOS Universal Links (web side)~~ — AASA route + Capacitor deep-link handler implemented (branch `MaloneySandboxAI/universal-links`, not yet merged); native Xcode steps remain (see iOS Build Prep)
- [x] ~~Push landing page to production~~ — landed on main; live at rallyplaylive.com
- [x] ~~Desmos production API key~~ — replaced with open-source stack (MathLive + math.js + function-plot); no recurring cost- [ ] **Decide on parent dashboard** — either apply migration 008 to create `parent_tokens` table (enables `/parent/[token]`), or remove the route from the app
- [x] ~~Unify gem economy~~ — untimed mode earns solo-rate gems; gem-earned card now visible on results screen (commit c3dc1b4)
- [x] ~~Cancel v0 Premium~~ — subscription canceled May 26, 2026
- [x] ~~Reconcile migration drift~~ — all required migrations confirmed applied (May 29, 2026)

### Short-term
- [x] ~~Send Desmos partnership email for API licensing~~ — sent May 26, 2026 to partnerships@desmos.com
- [x] ~~Landing page SEO optimization~~ — og tags, Twitter card, theme color, meta description all live on rallyplaylive.com
- [ ] Landing page: add Desmos calculator as a featured selling point
- [ ] Connect "Get Started Free" and "Log in" buttons on landing page to actual auth flow
- [ ] Mobile responsiveness QA on landing page

### Medium-term
- [ ] Direct friend challenges (currently random matching only — noted in FAQ)
- [ ] More AP subjects (Chemistry, Physics, Calculus AB/BC, World History, English Literature)
- [ ] Diagnostic quiz improvements
- [ ] Store page for gem spending
- [ ] Achievement badges / milestones

### Long-term / Ideas
- [ ] Real-time multiplayer (WebSocket-based simultaneous play)
- [ ] Teacher dashboard for classroom management
- [ ] Question submission / community content
- [ ] Study groups / team challenges
- [ ] Spaced repetition review mode
- [ ] Dark/light theme toggle

---

## Technical Debt
- `app/play/page.tsx` is ~1160 lines with tightly-coupled timer/answer/advance effects — the timeout/advance flow is subtle (see CLAUDE.md > "Question transition + the phantom-timeout bug"); could be split into smaller components/hooks
- `next.config.mjs` has `ignoreBuildErrors: true` — should fix underlying type errors
- Calculator stack migrated to open-source (was Desmos $100/mo demo key)
- No automated tests
- No CI/CD beyond Vercel auto-deploy
- No Supabase CLI — migrations applied manually via dashboard SQL Editor; prod can drift from `supabase/migrations/` file history (some files pre-applied in prod, some never run). All new migrations must be idempotent — see CLAUDE.md > Database Migrations.

---

## Key Contacts & Accounts
- **Vercel**: ctgmaloney-7849 (Hobby plan, free)
- **GitHub**: MaloneySandboxAI/rally
- **Supabase**: Rally project (PostgreSQL + Auth)
- **PostHog**: Rally analytics project
- **Stripe**: Subscription payments
- **v0 by Vercel**: Landing page project (v0-rally-landing-page) — Premium canceled May 26, 2026

---

## Build & Deploy Cheat Sheet
```bash
# Push changes to production (local clone lives at ~/conductor/repos/rally)
cd ~/conductor/repos/rally && git add -A && git commit -m "description" && git push origin main

# Vercel auto-deploys in ~30-35 seconds
# Check deploy: https://vercel.com/ctgmaloney-7849s-projects/rally/deployments
# Live site: https://rallyplaylive.com
```
