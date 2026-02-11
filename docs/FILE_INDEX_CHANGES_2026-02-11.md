# File Index - Changes 2026-02-11

## Nouveaux fichiers
- `src/app/game/startup/plan/page.tsx`
- `src/components/analytics/PlausibleScript.tsx`
- `src/components/support/CrispChat.tsx`
- `src/lib/analytics.ts`
- `src/lib/stripe.ts`
- `src/lib/email-followups.ts`
- `src/lib/pdf-builder.ts`
- `src/app/api/checkout/create-session/route.ts`
- `src/app/api/checkout/webhook/route.ts`
- `src/app/api/cron/email-followups/route.ts`
- `src/app/checkout/deep-dive/page.tsx`
- `src/app/checkout/success/page.tsx`
- `src/app/checkout/cancel/page.tsx`
- `src/data/case-studies.ts`
- `supabase/migrations/005_growth_features.sql`
- `vercel.json`

## Fichiers modifies (principaux)
- `src/hooks/use-game.tsx`
- `src/lib/game-state.ts`
- `src/app/api/admin/overview/route.ts`
- `src/app/api/lead/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/email/send/route.ts`
- `src/app/api/game/generate-pdf/route.ts`
- `src/lib/email.ts`
- `src/lib/pdf.ts`
- `src/components/game/GameFlow.tsx`
- `src/components/game/ReportDisplay.tsx`
- `src/app/game/startup/results/page.tsx`
- `src/app/game/audit/results/page.tsx`
- `src/app/game/portfolio/results/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/lib/validators.ts`
- `README.md`
- `.env.example`
- `.gitignore`
- `tsconfig.json`
- `next.config.ts`

## Validation associee
- Build: OK (`npm run build`)
- Test API PDF: OK (`npx playwright test tests/pdf.spec.ts`)
- ESLint cible: OK
