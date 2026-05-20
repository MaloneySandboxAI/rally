---
name: rally-dev
description: "Rally SAT/AP prep app development skill. Use this skill whenever working on the Rally codebase — adding features, fixing bugs, writing Conductor prompts, reviewing code, or making architectural decisions. Triggers on: any mention of Rally, SAT prep, AP prep, challenge mode, gem economy, Desmos calculator, WorkArea, category rings, subtopic levels, or any file in the rally repo. Also use when the user asks to build a new feature, fix a bug, or review code in the context of the Rally app."
---

# Rally Development Skill

## Quick Reference

### What is Rally?
A mobile-first SAT & AP prep app where students challenge friends to head-to-head quiz battles. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, hosted on Vercel.

**Live site**: rallyplaylive.com
**GitHub**: MaloneySandboxAI/rally
**Owner**: Maloney Evaine (maloney@evaine.ai)

---

## Architecture at a Glance

### Category System
Categories are defined in `lib/categories.ts`. Each has an `isMath` boolean flag that controls timer lengths, calculator type (Desmos vs basic), and other math-specific behavior.

```
Math:     Algebra (#378ADD), Data & Statistics (#F97316), AP Pre Calculus (#EC4899)
Non-math: Reading (#14B8A6), Grammar (#A855F7), AP Bio (#22C55E), APUSH (#F59E0B), AP English (#6366F1)
```

### Game Modes
1. **Solo Timed** — adaptive difficulty, earn gems, speed bonus
2. **Challenge (H2H)** — 4x gem multiplier, shared 15-question pool, link-based invite
3. **Group Challenge** — classroom mode, multiple participants, shared leaderboard
4. **Untimed Practice** — no timer, no gems, full explanations, endless questions

### Gem Economy
| Mode | Easy | Medium | Hard | Speed Bonus |
|------|------|--------|------|-------------|
| Solo Timed | 10 | 20 | 40 | 1.5x |
| Challenge | 40 | 80 | 160 | 1.5x |
| Untimed | 0 | 0 | 0 | N/A |

### Adaptive Difficulty
Both solo and challenge modes use adaptive difficulty: start easy, bump up on correct answer, drop on wrong. Challenge pools are pre-built (5 easy + 5 medium + 5 hard = 15 questions).

---

## Key Patterns

### Adding a New Feature
1. Create the component in `components/rally/`
2. Add any server-side logic to `lib/`
3. If it needs a new page, create `app/[route]/page.tsx`
4. If it needs Supabase tables, document the schema (but note: sandbox cannot reach Supabase directly — SQL must be run in the Supabase dashboard)

### Working with the WorkArea (Bottom Sheet)
The WorkArea is a bottom sheet overlay (z-50) with 3 tabs: Notepad, Calculator, Draw.
- For math categories (`isMath: true`), the Calculator tab shows Desmos (graphing + scientific toggle)
- For non-math categories, it shows a basic calculator
- The `isVisible` prop triggers `resize()` on Desmos when the Calculator tab is selected
- Located in `components/rally/work-area.tsx`

### Challenge Flow
1. Creator selects category via `challenge-button.tsx`
2. `getChallengePool()` builds a 15-question pool from the selected category
3. Pool stored as flat `integer[]` via `poolToFlat()`
4. Creator must share the link BEFORE playing (enforced in UI)
5. Both players draw from the same pool with independent adaptive difficulty
6. Winner = more total gems earned (not just correct count)
7. `creator_score = -1` sentinel means creator hasn't played yet

### State Management
- Auth: Supabase Auth + `auth-gate.tsx` wrapper
- Gems: `gem-context.tsx` React context
- Premium: `premium-context.tsx` React context  
- Questions: `question-tracker-context.tsx` for tracking answered questions
- No Redux — all state is React context + Supabase queries

### Styling Conventions
- Dark navy theme: bg `#021f3d`, accent `#378ADD`, text `#85B7EB`
- Mobile-first: design for iPhone, minimize scrolling
- Tailwind utility classes only (no CSS modules)
- `font-extrabold` for headings, `font-bold` for labels
- `rounded-xl` for cards, `rounded-2xl` for containers
- Bottom sheets for modal interactions

---

## Development Workflow

### How Code Gets Deployed
1. Edit files locally or via Cowork/Conductor
2. Push to main: `cd ~/Desktop/rally && git add -A && git commit -m "msg" && git push origin main`
3. Vercel auto-deploys in ~30-35 seconds
4. `next.config.mjs` has `ignoreBuildErrors: true` so type errors don't block deploys

### Writing Conductor Prompts
When creating prompts for Conductor (AI code agent):
- Be extremely specific about file paths and line numbers
- Include the exact code to add/replace with context lines
- List files to create vs files to modify separately
- Include a testing section with specific steps
- Note any "DO NOT" constraints (e.g., "do not remove existing CalculatorTab")
- Save prompts as `.md` files in the rally repo root (e.g., `conductor-desmos-prompt.md`)

### Sandbox Limitations
- Cannot reach npm registry — cannot install packages
- Cannot reach Supabase directly — cannot run queries or migrations
- CAN edit files, run local commands, and push via git
- For DB changes, provide SQL for the user to run in Supabase dashboard

---

## Common Tasks

### Adding a New Category
1. Add to `ALL_CATEGORIES` array in `lib/categories.ts`
2. Set `isMath` flag appropriately
3. Timer lengths are determined by `isMath` in `app/play/page.tsx`
4. Questions must exist in Supabase for the new category ID

### Modifying the Landing Page
- Edit `app/page.tsx` — self-contained marketing page
- Logged-in users auto-redirect to `/home` (handled in useEffect)
- Uses same Tailwind dark theme as the app

### Adding Supabase RLS Policies
- Write the SQL policy
- Document it clearly for the user to run in Supabase dashboard
- Test by describing expected behavior for authenticated vs anonymous users

### Working with Push Notifications
- `lib/push-notifications.ts` — subscription management
- `lib/challenge-notify.ts` — sends notifications on challenge completion
- Service worker handles delivery
- Push subscriptions stored in Supabase

---

## File Quick-Find

| What you need | Where to look |
|--------------|---------------|
| Category definitions | `lib/categories.ts` |
| Gameplay logic | `app/play/page.tsx` |
| Challenge CRUD | `lib/challenges.ts` |
| Group challenges | `lib/group-challenges.ts` |
| Question fetching | `lib/questions.ts` |
| H2H records | `lib/head-to-head.ts` |
| Weekly recap | `lib/weekly-recap.ts` |
| Gem economy context | `lib/gem-context.tsx` |
| Premium/subscription | `lib/subscription.ts`, `lib/premium-context.tsx` |
| Auth wrapper | `components/rally/auth-gate.tsx` |
| Home page | `app/home/page.tsx` |
| Bottom sheet tools | `components/rally/work-area.tsx` |
| Desmos calculator | `components/rally/desmos-calculator.tsx` |
| Basic calculator | `components/rally/calculator.tsx` |
| Challenge creation | `components/rally/challenge-button.tsx` |
| Results + share | `components/rally/results-screen.tsx`, `challenge-share-card.tsx` |
| Navigation | `components/rally/bottom-nav.tsx` |
| Analytics | `lib/posthog-provider.tsx` |
| Supabase client | `lib/supabase/client.ts` |
| Supabase server | `lib/supabase/server.ts` |
