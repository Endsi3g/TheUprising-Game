# Deployment Checklist - 2026-02-11

## 1) Variables d'environnement
Configurer au minimum:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_TENANT_ID=

# Email
RESEND_API_KEY=
EMAIL_FROM=
CRON_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_DEEP_DIVE_PRICE_ID=

# Analytics / Support
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_CRISP_WEBSITE_ID=
```

## 2) Migration base de donnees
Appliquer:
- `supabase/migrations/005_growth_features.sql`

Cette migration ajoute:
- `email_followups`
- `checkout_events`
- indexes + policies de base

## 3) Cron de follow-up emails
Le projet contient:
- `vercel.json` avec cron journalier sur `/api/cron/email-followups`
- Endpoint securise:
  - header `x-cron-secret: <CRON_SECRET>`
  - ou `Authorization: Bearer <CRON_SECRET>`

Verifier que le provider cron transmet bien le secret.

## 4) Stripe
Verifier:
1. `STRIPE_DEEP_DIVE_PRICE_ID` pointe vers le bon produit/prix.
2. Webhook Stripe cible `/api/checkout/webhook`.
3. Secret webhook est correct (`STRIPE_WEBHOOK_SECRET`).
4. Evenement minimum active:
   - `checkout.session.completed`

## 5) Smoke tests post-deploy
Executer:
1. `POST /api/game/generate-pdf` avec payload valide -> PDF.
2. Parcours startup -> result -> `startup/plan`.
3. `POST /api/checkout/create-session` -> URL checkout.
4. Webhook Stripe -> insertion `checkout_events`.
5. Creation lead/contact -> insertion `email_followups`.
6. Appel cron -> traitement des rows dues.

## 6) Monitoring recommande
- Erreurs API:
  - `/api/game/generate-pdf`
  - `/api/checkout/*`
  - `/api/cron/email-followups`
- Conversion funnel:
  - page view -> report ready -> lead -> checkout
- Taux d'envoi emails follow-up (sent vs error)

## 7) Rollback rapide
Si probleme critique:
1. Desactiver cron emails (ou retirer secret).
2. Cacher CTA checkout (UI) et/ou invalider `STRIPE_DEEP_DIVE_PRICE_ID`.
3. Garder MVP actif (audit/startup/portfolio + report/pdf).
