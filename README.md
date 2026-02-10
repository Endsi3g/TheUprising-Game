<<<<<<< HEAD
# Salon AI - The Uprising Studio

 Système d'audit et de prospection multi-agents propulsé par l'IA.

## Fonctionnalités Clés

- **Audit Multi-Agents** : Une équipe d'agents spécialisés (SEO, Copywriting, UX, Design) analyse vos sites web.
- **Vosk Voice Integration** : Interaction vocale temps réel avec détection de langue et Voice Activity Detection (VAD).
- **Tableau de Bord Admin** : Suivi des sessions, des leads et métriques de conversion en temps réel.
- **Interface Chat Moderne** : Expérience utilisateur fluide basée sur Shadcn UI.
- **Support Multi-LLM** : Compatible avec Ollama (local) et Grok (xAI).

## Architecture

- **Frontend** : Next.js 14, React, Tailwind CSS, Shadcn UI.
- **Backend** : Supabase (Auth, DB, Realtime).
- **IA** : Custom Multi-Agent Orchestrator.

## Installation

1. `npm install`
2. Configurez `.env.local` (voir `.env.example`)
3. `npm run dev`

---
*Propulsé par le studio The Uprising Studio.*
=======
# 🎮 The Uprising Game (salon-ai)

> [!IMPORTANT]  
> **État du Projet (Février 2026) :** L'application est en phase de développement avancée. Un audit complet a identifié les fonctionnalités cœurs ainsi que les pages critiques manquantes.  
> 📋 **[Consulter le Rapport d'Audit Complet](file:///c:/The-Uprising-Game/TheUprising-Game/AUDIT_REPORT.md)**

**The Uprising Game** est une expérience interactive conçue spécifiquement pour les salons et événements. Il s'agit d'un jeu piloté par une intelligence artificielle conversationnelle où un personnage animé interagit avec les utilisateurs pour explorer leur univers professionnel.

## 🎯 Concept du Projet

L'application transforme l'onboarding et l'audit d'entreprise en un jeu immersif :

- **Interaction Vocale & Texte** : Utilisez le micro pour parler directement à l'avatar ou communiquez par texte.
- **Avatar Animé** : Un personnage dynamique qui pose des questions pertinentes sur votre domaine d'activité.
- **Templates Intelligents** : Association automatique avec des modèles sectoriels selon les réponses de l'utilisateur.
- **Clonage de Voix** : Intégration avec **Eleven Labs** pour une personnalisation vocale poussée.
- **Expérience Mobile** : Un code QR permet de basculer l'expérience sur votre téléphone personnel instantanément.

## 🕹️ Modes de Jeu

La plateforme propose trois modes d'interaction distincts :

1. **Démarrage Entreprise** : Accompagnement pas à pas pour structurer une nouvelle idée.
2. **Portfolio par Niche** : Création et mise en valeur de réalisations spécifiques pour un secteur donné.
3. **Audit Site Existant** : Analyse critique et suggestions d'amélioration pour une présence en ligne actuelle.

## 📊 Développement

- **Temps de développement estimé** : 2 à 3 semaines.
- **Objectif** : Créer un outil d'engagement client premium et mémorable.

## 🛠️ Stack Technique

Le projet repose sur une architecture moderne et performante :

- **Animation & IA** : Avatar interactif avec gestion du flux vocal/texte.
- **Voix** : Eleven Labs API pour le clonage et la synthèse vocale.
- **Frontend** : [Next.js 16](https://nextjs.org/) avec App Router et [TypeScript 5](https://www.typescriptlang.org/).
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/) pour un design flexible et des animations fluides.
- **Backend & Database** : [Supabase](https://supabase.com/) pour l'authentification et le stockage de données en temps réel.

## 🚀 Commencer

Le moyen le plus simple de démarrer le projet localement est d'utiliser le script de configuration automatisé.

### Installation Rapide (Windows)

1. Clonez le dépôt.
2. Double-cliquez sur `setup-localhost.bat` à la racine du projet.
3. Le script vérifiera vos dépendances, installera les packages nécessaires et configurera votre fichier `.env`.

### Installation Manuelle

Si vous préférez procéder manuellement :

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## 📂 Structure du Projet

- `src/` : Code source de l'application (pages, composants, hooks).
- `public/` : Assets statiques (images, polices).
- `supabase/` : Configurations et schémas de base de données.
- `scripts/` : Utilitaires et scripts d'automatisation.

---
*Ce projet est une initiative de l'équipe **The Uprising**.*
>>>>>>> 91470b8 (Update: 2026-02-10 12:10)
