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

## Recently Completed (May 26, 2026)
- [x] Landing page pushed to production (live at rallyplaylive.com with full OG/Twitter meta)
- [x] Untimed gem economy unified — gem-earned card now shown on results screen for untimed sessions (commit c3dc1b4)
- [x] v0 Premium subscription canceled
