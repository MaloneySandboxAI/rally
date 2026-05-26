# Rally Project Status & Roadmap

*Last updated: May 26, 2026*

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
- [x] Guest play mode
- [x] Age verification (COPPA)
- [x] Profile setup flow
- [x] Parent dashboard

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
- [x] Desmos graphing calculator integration (same as SAT Bluebook)
- [x] Scientific calculator mode toggle
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

---

## In Progress / Pending

### Immediate (This Sprint)
- [x] ~~Push landing page to production~~ — landed on main; live at rallyplaylive.com
- [ ] **Desmos production API key** — partnership email sent May 26, 2026 (awaiting reply); currently using demo key `dcb31709b452b1cf9dc26972add0fda6`
- [x] ~~Unify gem economy~~ — untimed mode earns solo-rate gems; gem-earned card now visible on results screen (commit c3dc1b4)
- [x] ~~Cancel v0 Premium~~ — subscription canceled May 26, 2026

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
- `app/play/page.tsx` is ~1900 lines — could be split into smaller components
- `next.config.mjs` has `ignoreBuildErrors: true` — should fix underlying type errors
- Demo Desmos API key needs replacement before scaling
- No automated tests
- No CI/CD beyond Vercel auto-deploy

---

## Key Contacts & Accounts
- **Vercel**: ctgmaloney-7849 (Hobby plan, free)
- **GitHub**: MaloneySandboxAI/rally
- **Supabase**: Rally project (PostgreSQL + Auth)
- **PostHog**: Rally analytics project
- **Stripe**: Subscription payments
- **Desmos**: Partnership email pending (for production API key)
- **v0 by Vercel**: Landing page project (v0-rally-landing-page) — Premium canceled May 26, 2026

---

## Build & Deploy Cheat Sheet
```bash
# Push changes to production
cd ~/Desktop/rally && git add -A && git commit -m "description" && git push origin main

# Vercel auto-deploys in ~30-35 seconds
# Check deploy: https://vercel.com/ctgmaloney-7849s-projects/rally/deployments
# Live site: https://rallyplaylive.com
```
