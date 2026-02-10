# Intégration de Projets Framer dans Next.js

Ce guide explique comment intégrer vos projets Framer (ou tout autre site externe) dans l'application Next.js.

## Méthode 1 : Iframe (Recommandé pour la simplicité)

C'est la méthode la plus rapide pour afficher un projet Framer existant sans modifier son code.

### Étape 1 : Obtenir l'URL Publique

Assurez-vous que votre projet Framer est publié et accessible via une URL (ex: `https://mon-projet.framer.website`).

### Étape 2 : Créer un Composant FramerWrapper

Créez un composant réutilisable pour afficher l'iframe.

```tsx
// src/components/ui/FramerWrapper.tsx
import React from 'react';

interface FramerWrapperProps {
  url: string;
  title?: string;
  className?: string;
}

export const FramerWrapper: React.FC<FramerWrapperProps> = ({ url, title = "Framer Project", className }) => {
  return (
    <div className={`w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <iframe
        src={url}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
```

### Étape 3 : Utilisation

Utilisez ce composant dans n'importe quelle page ou Bento Grid.

```tsx
import { FramerWrapper } from '@/components/ui/FramerWrapper';

export default function PortfolioPage() {
  return (
    <div className="p-8">
      <FramerWrapper url="https://mon-projet.framer.website" />
    </div>
  );
}
```

## Méthode 2 : Framer Motion (Pour l'animation native)

Si vous voulez recréer des animations Framer nativement dans Next.js, utilisez la librairie `framer-motion`.

1. Installez la librairie : `npm install framer-motion`
2. Importez et utilisez `motion.div`.

```tsx
import { motion } from 'framer-motion';

export const AnimatedCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-6 bg-white rounded-xl shadow-lg"
  >
    <h1>Contenu Animé</h1>
  </motion.div>
);
```

## Intégration dans le Bento Grid

Vous pouvez utiliser l'iframe à l'intérieur d'un élément Bento.

```tsx
<BentoGridItem
  title="Projet Framer"
  description="Une démonstration interactive."
  header={<FramerWrapper url="..." className="h-40" />}
  className="md:col-span-2"
/>
```
