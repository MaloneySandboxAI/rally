# Rally - SAT Prep App

## Overview
Rally is a SAT prep quiz app with solo and challenge (head-to-head) modes. Built with Next.js (App Router), TypeScript, Supabase (PostgreSQL + Auth), hosted on Vercel (auto-deploys on push to main).

## Tech Stack
- **Framework**: Next.js 14+ (App Router), React, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth, email magic link, guest play)
- **Hosting**: Vercel (auto-deploy from `main` branch)
- **GitHub**: MaloneySandboxAI account

## Key Architecture

### Categories
Algebra, Reading Comprehension, Grammar, Data & Statistics, AP Biology, AP Pre Calculus, AP US History, AP English Language

### Gem Economy
- Solo rates: Easy 10, Medium 20, Hard 40
- Challenge rates: Easy 40, Medium 80, Hard 160 (4x multiplier)
- Speed bonus: 1.5x for fast answers

### Challenge System
- **Flow**: Creator picks category -> shares link -> THEN plays their round (link must be shared before play unlocks)
- **Scoring**: Winner determined by total gems earned (not correct count) — rewards harder difficulty
- **Shared question pool**: 15 questions per challenge (5 easy + 5 medium + 5 hard), stored as flat `integer[]` in DB
- **Adaptive difficulty**: Both players start easy, bump up on correct, drop on wrong, drawing from the same pool
- **DB sentinel**: `creator_score = -1` means creator hasn't played yet; `status` is 'pending' or 'completed'

### Question Pool Storage
- `question_ids` column is `integer[]` (NOT jsonb)
- `poolToFlat(pool)`: flattens `{easy, medium, hard}` to `[...easy, ...medium, ...hard]`
- `poolFromFlat(flat)`: reconstructs by slicing at indices 0-5, 5-10, 10-15

### Timer System (category-aware)
- Math categories: Easy 45s, Medium 75s, Hard 120s
- Reading categories: Easy 35s, Medium 55s, Hard 90s
- Untimed practice mode: no timer, endless 1-at-a-time questions, no gems, full explanation review

### Untimed Practice Mode
- Toggle appears as bottom sheet when tapping a subtopic on the skills page
- URL param: `&untimed=true` on `/play`
- No timer, no hearts/lives, no gems, no speed bonus
- Endless play — user taps "done" in header when finished
- Full explanation shown after each answer (not line-clamped)
- Stats + subtopic levels still adjust; gems do not

### Stale Challenge Cleanup
- Pending challenges older than 7 days show as "expired" in games list
- Creator can delete individually (X button) or batch delete all expired

### Analytics
- PostHog for analytics, person profiles via `posthog.identify()` in `lib/posthog-provider.tsx`
- Internal user filtering: cohort excludes @evaine.ai and ctgmaloney@gmail.com

## Key Files
- `components/rally/challenge-button.tsx` — Challenge creation UI (bottom sheet), gates play behind link share
- `app/play/page.tsx` — Main gameplay (~1900 lines), handles solo + challenge + untimed modes
- `app/skills/page.tsx` — Subtopic list per category, mode selection bottom sheet (timed vs untimed)
- `app/challenge/[code]/page.tsx` — Challenge accept / results page
- `lib/challenges.ts` — Challenge CRUD, pool flatten/unflatten, stale challenge detection/cleanup
- `lib/questions.ts` — Question fetching, `getChallengePool()`, `getOneQuestion()`, `getQuestionsByIds()`
- `lib/posthog-provider.tsx` — PostHog init + user identification
- `components/rally/games-list.tsx` — Active games list with expired challenge management
- `components/rally/category-rings.tsx` — Home page category selection (links to /skills)
- `app/home/page.tsx` — Home page layout

## Important Notes
- Sandbox cannot reach npm registry or Supabase directly — can only edit files
- User pushes from local terminal: `cd ~/Desktop/rally && git add -A && git commit -m "msg" && git push origin main`
- Mobile-first design — minimize scrolling on iPhone
- User prefers "auto mode" with minimal back-and-forth
