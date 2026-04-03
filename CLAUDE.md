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
Algebra, Reading Comprehension, Grammar, Data & Statistics

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

## Key Files
- `components/rally/challenge-button.tsx` — Challenge creation UI (bottom sheet), gates play behind link share
- `app/play/page.tsx` — Main gameplay (~1600 lines), handles solo + challenge modes
- `app/challenge/[code]/page.tsx` — Challenge accept / results page
- `lib/challenges.ts` — Challenge CRUD, pool flatten/unflatten helpers
- `lib/questions.ts` — Question fetching, `getChallengePool()`, `getOneQuestion()`, `getQuestionsByIds()`
- `components/rally/category-cards.tsx` — Category selection cards
- `app/page.tsx` — Home page

## Important Notes
- Sandbox cannot reach npm registry or Supabase directly — can only edit files
- User pushes from local terminal: `cd ~/Desktop/rally && git add -A && git commit -m "msg" && git push origin main`
- Mobile-first design — minimize scrolling on iPhone
- User prefers "auto mode" with minimal back-and-forth
