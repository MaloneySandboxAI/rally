# Rally — App Store Launch Plan (iOS first)

**Owner:** Colleen Maloney
**Date:** June 26, 2026
**Status:** Legal/account foundation complete (via FoxDog). App packaging not yet started.
**Approach:** Wrap the existing Next.js app in a native iOS shell with **Capacitor**, loading the live site (`https://rallyplaylive.com`). No Flutter rebuild. FoxDog is **not** used beyond the legal/account setup below.

---

## 1. Completed legal / account steps (done via FoxDog)

These are finished and do **not** need to be redone. This is the foundation that lets us submit to the App Store.

| Step | What it covers | Status |
|------|----------------|--------|
| Business entity decision | Chose the legal structure to publish under | ✅ Done |
| LLC formation | LLC filed | ✅ Done |
| Registered agent address | Registered agent / business address on file | ✅ Done |
| EIN | Federal Employer Identification Number obtained | ✅ Done |
| DUNS number | D-U-N-S number obtained (needed for org Apple account) | ✅ Done |
| Apple Developer enrollment | Enrolled in the Apple Developer Program | ✅ Done |
| Store account setup | Developer/store account created | ✅ Done |
| Store choice | Targeting iOS App Store first | ✅ Done |
| Tech stack decision | Stay on Next.js; wrap with Capacitor (not Flutter) | ✅ Done |
| FoxDog MCP installed | Tooling installed (now scoped out for the build) | ✅ Done |

**Net effect:** We have a legal entity, an enrolled Apple Developer account, and a store account ready to receive an app. The remaining work is purely technical packaging + the App Store Connect listing.

---

## 2. Packaging decision & rationale

**Decision: Capacitor native shell that loads the live site.**

- Rally is a Next.js App Router app (SSR, server components, server-side Supabase, dynamic routes like `/challenge/[code]`, `/group/[code]`, `/parent/[token]`) hosted on Vercel.
- A static export (required to bundle the web build offline) would mean ripping out / refactoring all server-rendered pieces — large effort.
- Rally is inherently online (questions, gems, challenges, leaderboards, auth all hit Supabase), so a bundled offline mode wouldn't actually function anyway.

**Chosen content mode: load `https://rallyplaylive.com` in a WKWebView via Capacitor.**

Trade-offs accepted:
- ✅ One codebase. Push to Vercel as today → app instantly reflects it. No app resubmission for normal feature/content/bug work.
- ✅ No version skew between web and app.
- ✅ No SSR→static rewrite.
- ⚠️ App requires a network connection (acceptable — gameplay needs the backend regardless).
- ⚠️ Binary-level changes (icon, splash, plugins, Capacitor upgrades) still require a new App Store submission.

---

## 3. Capacitor implementation plan (for Cowork)

> Run from the repo root: `~/Desktop/rally` (local) / current Conductor checkout.

### 3.1 Install Capacitor
```bash
pnpm add @capacitor/core
pnpm add -D @capacitor/cli
pnpm add @capacitor/ios
# Optional native plugins we'll likely want:
pnpm add @capacitor/status-bar @capacitor/splash-screen @capacitor/app
```

### 3.2 Initialize Capacitor
```bash
npx cap init "Rally" "com.<yourentity>.rally" --web-dir=public
```
- App name: **Rally**
- Bundle ID: pick the final reverse-DNS id, e.g. `com.rallyplaylive.app` — **this must match the App ID registered in the Apple Developer portal**. Confirm/create it there first.
- `--web-dir` is required by the CLI but is irrelevant in live-site mode (we don't copy a build); `public` is a safe placeholder.

### 3.3 Configure `capacitor.config.ts` (live-site mode)
Create `capacitor.config.ts` at repo root:
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rallyplaylive.app',
  appName: 'Rally',
  webDir: 'public',
  server: {
    url: 'https://rallyplaylive.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#021f3d',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#021f3d',
      showSpinner: false,
    },
  },
};

export default config;
```

### 3.4 Add the iOS platform
```bash
npx cap add ios
npx cap sync ios
```
This creates `ios/` (an Xcode project). Commit it to the repo.

### 3.5 Native polish (do in Xcode / asset tooling)
- **App icon**: 1024×1024 master → generate the icon set. Use Rally's logo on the navy `#021f3d` background.
- **Splash screen**: navy background, centered logo.
- **Status bar**: light content on the navy background (configure via `@capacitor/status-bar`).
- **Safe areas**: verify the web layout respects iPhone notch/home-indicator insets (`contentInset: 'always'` helps; check the header and bottom-nav).
- **Display name**: ensure the home-screen label reads "Rally".

### 3.6 Auth / OAuth caveat to verify ⚠️
Rally uses Supabase Auth incl. **Google OAuth** and **email magic links**. In a WKWebView these need attention:
- Google OAuth from inside a plain webview is often blocked by Google ("disallowed_useragent"). Plan to use a system browser / `ASWebAuthenticationSession` flow (Capacitor Browser plugin or a Supabase native OAuth approach) and confirm the redirect returns to the app.
- Magic-link / challenge deep links from iMessage should ideally open the app — this ties into the **iOS Universal Links** item already noted as pending in CLAUDE.md (awaiting Apple Developer enrollment, which is now ✅ done — so Universal Links can be set up).
- **Action:** test sign-in end-to-end early; this is the most likely rejection/usability risk.

### 3.7 Apple sign-in note ⚠️
Apple Guideline 4.8: if the app offers third-party social login (Google), it generally must **also** offer Sign in with Apple. Verify whether Rally needs to add Sign in with Apple before submission.

---

## 4. Build & submit (on the Mac — keys stay local)

1. `npx cap open ios` → opens Xcode.
2. Set **Signing & Capabilities** → Team = your enrolled Apple Developer account; Bundle ID matches the registered App ID.
3. Set version (1.0.0) and build (1).
4. **Product → Archive** → **Distribute App → App Store Connect → Upload** (to TestFlight).
5. Install via TestFlight on a real iPhone; run the smoke test (see §6).
6. In **App Store Connect**, create the app record (if not already), attach the build, fill the listing (§5), submit for review.

---

## 5. App Store Connect listing checklist

- [ ] App name, subtitle, promotional text
- [ ] Description + keywords (FoxDog's `generate_store_copy` is fine to use for drafts)
- [ ] Primary + secondary category (Education)
- [ ] Screenshots — 6.7"/6.5" iPhone sizes (capture from the running app)
- [ ] App icon (1024×1024)
- [ ] Privacy Policy URL + Terms URL (must be reachable)
- [ ] **App Privacy** questionnaire (data collected: account/email, usage/analytics via PostHog, etc.)
- [ ] Age rating
- [ ] Support URL + marketing URL
- [ ] **Paid Applications Agreement** signed *only if* offering IAP. Rally uses **Stripe** for subscriptions today — see §7.
- [ ] Demo account / sign-in credentials for the reviewer (since app requires login)

---

## 6. Pre-submit smoke test (real device)

- [ ] App launches to the live site, no blank screen
- [ ] Google OAuth sign-in works (or Apple/email fallback)
- [ ] Email magic link returns to the app
- [ ] Play a solo round end-to-end; gems update
- [ ] Create + accept a challenge link
- [ ] Calculator opens in a math category
- [ ] Safe areas correct (no content under notch / home indicator)
- [ ] Privacy + Terms links open
- [ ] Backgrounding/foregrounding preserves session (cookie-based session, 30-day)

---

## 7. ⚠️ Payments — the biggest review risk

Rally currently upgrades via **Stripe** (`lib/subscription.ts`, `app/upgrade`). Apple's Guideline 3.1.1 requires that **digital subscriptions consumed in the app use Apple In-App Purchase**, not Stripe/web checkout. A webview app that sells premium via Stripe is a common rejection.

**Decide before submitting** (carry this into Cowork as its own task):
- **Option A:** Add Apple IAP for premium on iOS (StoreKit / a native bridge), keep Stripe on web. Most compliant; most work.
- **Option B:** Make the iOS app present premium as "manage on the web" without an in-app purchase path / price (reader-style). Risky — Apple often still rejects if upgrade is reachable in-app.
- **Option C:** Ship v1 as fully free on iOS (no upgrade entry point in the app), add IAP in v1.1.

**Recommendation:** Ship v1 with the upgrade path hidden on iOS (Option C) to get approved fast, then add proper IAP. Confirm with product before building.

---

## 8. Hand-off to Cowork — task list

1. [ ] Confirm final bundle ID and register the App ID in the Apple Developer portal.
2. [ ] Install + init Capacitor, add iOS platform, commit `ios/` + `capacitor.config.ts` (§3).
3. [ ] App icon + splash + status bar + safe-area pass (§3.5).
4. [ ] Fix/verify Google OAuth + magic-link flows inside the native shell (§3.6).
5. [ ] Decide + implement the payments approach (§7).
6. [ ] Set up iOS Universal Links (now unblocked — Apple enrollment done) so iMessage challenge links open the app.
7. [ ] Archive → TestFlight → device smoke test (§4, §6).
8. [ ] Build the App Store Connect listing + reviewer demo account (§5).
9. [ ] Submit for review.

---

## 9. What we are NOT doing
- ❌ No Flutter rebuild.
- ❌ No FoxDog scaffold/builder/QA/ship pipeline (Flutter-only; doesn't apply to Next.js).
- ❌ No static export / offline bundle (SSR + online-only gameplay make it not worth it).
- ❌ Android — deferred to a later launch (Capacitor can add it later with `npx cap add android`).
