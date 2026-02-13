# PROCHAINES ÉTAPES - THE UPRISING GAME (ROADMAPPING)

Ce document répertorie les priorités stratégiques et techniques pour faire passer l'application de sa version actuelle à un produit commercial complet et scalable.

## 🚀 PRIORITÉS HAUTE (Sprint Suivant)

### 1. Page de Roadmap "Startup" ✅ [COMPLETED]

- **Objectif** : Créer la page `/game/startup/plan` (actuellement manquante).
- **Contenu** : Résumé du projet, Roadmap phasée (MVP, V1, V2), ressources nécessaires et timeline estimée.
- **Valeur** : Ferme la boucle de l'expérience utilisateur pour le mode "Startup".

### 2. Automatisation des Emails (Lead Nurturing) ✅ [COMPLETED]

- **Outil suggéré** : Resend ou SendGrid.
- **Workflow** : Envoi automatique du rapport d'audit par email + série d'emails de suivi (J+1, J+7) avec des suggestions stratégiques.

### 3. Persistance des Formulaires ✅ [COMPLETED]

- **Objectif** : Utiliser le `localStorage` pour sauvegarder les réponses aux formulaires en cours de saisie.
- **Valeur** : Évite la perte de données si l'utilisateur rafraîchit la page accidentellement.

---

## 🎨 EXPÉRIENCE & DESIGN (Le "Waouh" Effect)

### 4. Intégration Framer

- **Objectif** : Remplacer les sections statiques ou complexes par des composants **Framer** pour une flexibilité de design maximale et des animations de niveau international.
- **Zones cibles** : Home Hero, Sections d'avantages du Portfolio.

### 5. Micro-Interactions & Audio

- **Audio** : Implémenter réellement les boutons "Enregistrement vocal" et le feedback sonore du chatbot.
- **Animations** : Ajouter des transitions fluides entre les étapes du wizard (via Framer Motion ou GSAP).

---

## 💰 MARKETING & CONVERSION

### 6. Chat Live & Support

- **Outil suggéré** : Intercom, Crisp ou Hubspot Chat.
- **Placement** : Un bouton flottant stable sur toutes les pages pour répondre aux questions en direct.

### 7. Preuve Sociale (Social Proof)

- **Objectif** : Remplacer les témoignages placeholders par de vrais cas d'études clients avec logos et liens vers les versions live.

### 8. Paiements & Checkout (Monétisation)

- **Outil** : Stripe.
- **MVP** : Proposer un "Audit Deep-Dive" payant (version Premium de l'audit actuel).

---

## 🔧 TECHNIQUE & BACKEND

### 9. Tableau de Bord Admin (Analytics)

- **Objectif** : Visualiser les taux de conversion (Visite -> Audit démarré -> Audit terminé -> Lead créé).
- **Technique** : Intégration de Plausible ou Google Analytics 4.

### 10. Sécurité & Scalabilité

- **Rate Limiting** : Protéger les API de génération (Audit, PDF, Chat) contre l'abus de tokens.
- **RLS Supabase** : Durcir les politiques de sécurité sur les tables `leads` et `sessions`.

---

## 📈 ÉVOLUTIONS FUTURES (V3+)

- **IA Multimodale** : Capacité de l'agent à analyser des captures d'écran directes du site client.
- **Espace Client** : Un dashboard où le client peut retrouver tous ses audits passés et suivre sa roadmap.
- **Mobile App** : Version compacte pour utilisation en stand lors de salons avec scan de QR Codes.
