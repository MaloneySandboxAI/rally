# Rally — Remaining Tasks

## Freemium Setup (YOUR manual steps — code is done)

### 1. Install new packages
```bash
cd ~/Desktop/rally && pnpm install
```

### 2. Run Supabase SQL migration
Open the Supabase SQL editor and run the contents of:
`supabase/migrations/001_freemium_schema.sql`

**Note:** This assumes a `users` table already exists. If it doesn't, you'll need to create one first with at minimum an `id` column matching `auth.users.id`.

### 3. Create Stripe products
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products → Add product
2. Product name: **Rally Premium**
3. Add Price 1: **$6.00 / month**
4. Add Price 2: **$50.00 / year**
5. Enable **7-day free trial** on both prices
6. Copy the Price IDs (price_...)

### 4. Set environment variables
Add to `.env.local` AND Vercel dashboard (Settings → Environment Variables):
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (from Supabase → Settings → API → service_role)
NEXT_PUBLIC_APP_URL=https://rallyplaylive.com
```

### 5. Register Stripe webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://rallyplaylive.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

### 6. Test the full flow
Use Stripe test card: `4242 4242 4242 4242`

| Scenario | Test Card | Expected |
|----------|-----------|----------|
| Successful subscription | 4242 4242 4242 4242 | User becomes active/trialing |
| Payment failure | 4000 0000 0000 0341 | Status → past_due |
| Cancel subscription | Via customer portal | Status → canceled |
| Free user hits gem cap | — | Upsell toast at 100 gems |
| Free user tries challenge | — | Redirect to upgrade page |

### 7. Push and deploy
```bash
cd ~/Desktop/rally && git add -A && git commit -m "feat: freemium model with Stripe" && git push origin main
```

---

## Engagement Features (from original 8-item spec)

### 6. Weekly Email Recap
- **Priority**: Lower
- **Tech**: Resend integration + Vercel cron job
- **Spec**: Sunday evening email with weekly stats — gems earned, streak status, category progress, weak spot nudge
- **Requires**: Email collection opt-in, Resend API key, Vercel cron route (`/api/cron/weekly-email`)

### 8. Push Notifications
- **Priority**: Lowest
- **Tech**: Web Push API + service worker
- **Spec**: Permission prompt after first completed session. Notifications for streak reminders (evening if haven't played), challenge received, challenge expiring soon
- **Requires**: VAPID keys, service worker registration, notification permission flow

## Notes
- Items 1–5, 7 from the original engagement spec are complete and deployed
- Weekly email and push notifications were deprioritized per the original ordering
