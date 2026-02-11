# The Uprising Game (salon-ai)

**État du projet (février 2026)** : l’application est en production, avec persistance Supabase, chatbot interactif et rapports d’audit actifs.

The Uprising Game est une expérience immersive pour salons et événements. Un personnage animé guide les visiteurs, capte des informations clés sur leur activité, et génère un rapport d’audit actionnable. Le tout est conçu pour maximiser l’engagement, la conversion et la collecte de leads.

## Objectif du produit

- Créer une expérience “waouh” en stand ou showroom.
- Qualifier rapidement une entreprise (ou une idée) via un parcours simple.
- Produire un rapport utile et téléchargeable en PDF.
- Enregistrer chaque interaction pour un suivi commercial propre.

## Fonctionnalités principales

- **Audit multi‑agents** : analyse SEO, copywriting, UX et design.
- **Chatbot interactif** : texte + voix (micro) selon la configuration.
- **Persistance Supabase** : sessions, historique, rapports, leads.
- **Rapport enrichi** : rendu Markdown structuré dans le chat.
- **Export PDF** : génération instantanée via endpoint dédié.
- **Recherche web** : enrichissement des audits par contexte marché.
- **Support multi‑LLM** : Ollama local, OpenAI, Gemini.

## Parcours utilisateur (de bout en bout)

1. L’utilisateur choisit un mode (Audit / Startup / Portfolio).
2. Il saisit son entreprise (session créée en base).
3. Le chatbot guide la conversation (messages sauvegardés en temps réel).
4. L’IA génère un rapport (persisté et disponible à tout moment).
5. Redirection automatique vers la page résultats.
6. Les données sont visibles dans `sessions` et `leads`.

## Modes de jeu

1. **Démarrage entreprise** : structuration d’idée, business model, positionnement.
2. **Portfolio par niche** : démonstration sectorielle avec templates ciblés.
3. **Audit de site existant** : analyse critique et recommandations concrètes.

## Stack technique

- **Frontend** : Next.js 16, React 19, Tailwind CSS 4.
- **Backend** : Supabase (DB, Auth, Leads).
- **IA** : orchestrateur multi‑agents avec Ollama, OpenAI, Gemini.
- **Infra** : Docker pour l’écosystème IA local.

## Démarrage

Installation rapide (Windows) :

1. Cloner le dépôt.
2. Lancer `setup-localhost.bat`.
3. Le script configure les dépendances, le `.env`, et lance Ollama via Docker.

Installation manuelle :

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer la stack locale (Ollama)
docker-compose up -d

# 3. Télécharger les modèles (si utilisation locale)
scripts/setup-ollama.bat

# 4. Configurer l'environnement
cp .env.example .env

# 5. Lancer le serveur
npm run dev
```

Ouvrir `http://localhost:3000`.

## Tests E2E (Playwright)

```bash
# Installer les navigateurs Playwright (une seule fois)
npx playwright install

# Lancer les tests E2E
npm run test:e2e
```

Variables utiles :
- `PLAYWRIGHT_BASE_URL` : URL de base si vous n’utilisez pas `http://localhost:3000`.

## API PDF

- Endpoint : `POST /api/game/generate-pdf`
- Payload : `{ report, title }` ou `report` conforme à `ReportJson`.
- Retour : PDF téléchargeable (`application/pdf`).

## Paiement Stripe (Audit Deep-Dive)

- Checkout page : `/checkout/deep-dive`
- API création session : `POST /api/checkout/create-session`
- Webhook Stripe : `POST /api/checkout/webhook`
- Variables requises : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_DEEP_DIVE_PRICE_ID`

## Email Follow-ups (J+1 / J+7)

- Scheduling automatique après création de lead ou envoi de rapport.
- Endpoint cron : `GET|POST /api/cron/email-followups`
- Protection : header `x-cron-secret` avec `CRON_SECRET`.

## Recherche web

- `SERPAPI_KEY` ou `SEARCH_API_KEY` active un moteur de recherche distant.
- Sans clé, un fallback Puppeteer est utilisé.

## Catalogue

- Si Supabase est configuré, l'API `GET /api/catalogue` lit la table définie par `CATALOGUE_TABLE` (par défaut `catalogue_items`).
- Sans configuration Supabase, un catalogue mock est renvoyé.

## Structure du projet

- `src/` : pages, composants, hooks.
- `supabase/` : migrations et schémas de base.
- `scripts/` : utilitaires de test et setup Ollama.
- `docker-compose.yml` : orchestration des services IA locaux.

---

Projet porté par l’équipe The Uprising.
