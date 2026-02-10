# 🎮 The Uprising Game (salon-ai)

> [!IMPORTANT]  
> **État du Projet (Février 2026) :** L'application est en phase de production. Les fonctionnalités de persistance Supabase, le chatbot interactif et les rapports d'audit sont pleinement opérationnels.

**The Uprising Game** est une expérience interactive conçue spécifiquement pour les salons et événements. Il s'agit d'un jeu piloté par une intelligence artificielle conversationnelle où un personnage animé interagit avec les utilisateurs pour explorer leur univers professionnel.

## 🚀 Fonctionnalités Clés

- **Audit Multi-Agents** : Analyse SEO, Copywriting, UX et Design automatisée.
- **Persistance Supabase** : Sauvegarde en temps réel des sessions, de l'historique de chat et des rapports.
- **Interaction Vocale & Texte** : Support pour le micro (Eleven Labs / Vosk) et le texte.
- **Génération de Leads** : Capture automatique des contacts dans la base de données.
- **Support Multi-LLM** : Compatible avec Ollama (local), OpenAI (gpt-4o) et Grok.

## 🕹️ Modes de Jeu

1. **Démarrage Entreprise** : Accompagnement pas à pas pour structurer une nouvelle idée.
2. **Portfolio par Niche** : Galerie des projets avec carousel et templates sectoriels.
3. **Audit Site Existant** : Analyse critique et suggestions d'amélioration avec rapport détaillé.

## 🛠️ Stack Technique

- **Frontend** : [Next.js 16](https://nextjs.org/), React 19, Tailwind CSS 4.
- **Backend** : [Supabase](https://supabase.com/) (Database, Auth, Leads).
- **IA** : Custom Multi-Agent Orchestrator avec support Ollama & OpenAI.
- **Infrastructure** : [Docker](https://www.docker.com/) pour le déploiement local de l'IA.

## 🏁 Commencer

### Installation Rapide (Windows)

1. Clonez le dépôt.
2. Double-cliquez sur `setup-localhost.bat`.
3. Le script configurera vos dépendances, votre `.env` et lancera la stack Ollama via Docker.

### Installation Manuelle

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer la stack locale (Ollama)
docker-compose up -d

# 3. Télécharger les modèles (si utilisation locale)
scripts/setup-ollama.bat

# 4. Configurer l'environnement (Supabase & LLM keys)
cp .env.example .env

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## 📂 Structure du Projet

- `src/` : Code source (pages, composants, hooks).
- `supabase/` : Migrations et schémas de base de données.
- `scripts/` : Utilitaires de test et setup Ollama.
- `docker-compose.yml` : Orchestration des services IA locaux.

---
*Ce projet est une initiative de l'équipe **The Uprising**.*
