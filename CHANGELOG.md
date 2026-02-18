# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet adhère à la [Gestion Sémantique de Version](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-18

### feat(ui): integrate changelog into the application
- Create `/changelog` page that automatically parses and displays `CHANGELOG.md`.
- Add "Nouveautés" link with Sparkles icon to the home page footer.
- Map technical tags (feat, fix, etc.) to user-friendly French labels (Nouveauté, Correction, etc.).

## [1.1.0] - 2026-02-18

### feat(ai): enhance AI agents and startup mode
- Refactor AI agent core to use Gemini 2.0 native system instructions.
- Improve Startup mode logic for deeper business coaching and interactive co-design.

### feat(pdf): implement server-side PDF generation
- Create `/api/game/generate-pdf` endpoint using `pdfkit`.
- Add PDF download functionality to the report display UI with loading states.

### feat(agency): integrate agency CTAs and links
- Add "Contactez l'agence" and "Voir mon portfolio" links to `ReportDisplay`.
- Update LLM prompts to include agency URLs in generated strategy reports.

### fix(ui): resolve React rendering issues and linter errors
- Fix "set-state-in-effect" warnings in `QRHandoff` and `GameFlow`.
- Consolidate voice transcription hooks to prevent race conditions.
- Remove unused imports and fix unescaped entities across multiple components.

### docs: add integration roadmap and changelog
- Create `PLAN_INTEGRATION.md` for future feature planning.
- Add `CHANGELOG.md` to track project evolution.

### refactor(config): optimize Next.js configuration
- Enable `reactStrictMode` and configure `remotePatterns` for image optimization.

## [1.0.1] - 2026-02-15

### chore: project cleanup and maintenance
- Fix build issues and cleanup root directory.
- Resolve git merge conflicts in main entry page.

## [1.0.0] - 2026-02-10

### feat(security): implement security hardening (Phase 1)
- Add auth middleware, rate limiting, and SSRF guard.
- Implement Row Level Security (RLS) migrations and AdminGuard role checks.
- Add input validation using Zod and log redaction for sensitive data.

### feat(core): initial multi-tenant kiosk platform
- Setup Supabase integration with tenant-scoped data isolation.
- Implement conversational AI game flow with voice-to-text integration.
- Create admin dashboard for session and lead management.
