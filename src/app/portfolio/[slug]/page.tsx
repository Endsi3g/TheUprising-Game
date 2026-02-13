'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Monitor, Smartphone, ShoppingBag } from 'lucide-react';

interface Project {
    id: number;
    slug: string;
    title: string;
    description: string;
    longDescription: string;
    category: string;
    icon: any;
    techStack: string[];
    results: string[];
}

const projects: Project[] = [
    {
        id: 1,
        slug: 'e-learning',
        title: "Plateforme E-Learning",
        description: "Une interface éducative intuitive conçue pour maximiser l'engagement des étudiants avec des parcours personnalisés.",
        longDescription: "Conception et développement d'une plateforme d'apprentissage en ligne complète avec des parcours adaptatifs alimentés par l'IA. Le système analyse le comportement de chaque étudiant pour proposer du contenu personnalisé, des quiz interactifs et un suivi de progression en temps réel.",
        category: "Web Design",
        icon: Monitor,
        techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "OpenAI"],
        results: [
            "+45% d'engagement étudiant",
            "Réduction de 30% du taux d'abandon",
            "Score de satisfaction 4.8/5"
        ]
    },
    {
        id: 2,
        slug: 'analytics-ia',
        title: "Dashboard Analytics IA",
        description: "Tableau de bord complet permettant de visualiser des données complexes traitées par intelligence artificielle en temps réel.",
        longDescription: "Développement d'un tableau de bord analytique nouvelle génération intégrant des modèles d'IA pour l'analyse prédictive. Visualisations interactives, alertes intelligentes et rapports automatisés pour une prise de décision data-driven.",
        category: "SaaS B2B",
        icon: Smartphone,
        techStack: ["React", "D3.js", "Python", "TensorFlow", "PostgreSQL"],
        results: [
            "Traitement de 10M+ de données en temps réel",
            "Précision prédictive de 92%",
            "ROI client multiplié par 3"
        ]
    },
    {
        id: 3,
        slug: 'marketplace-bio',
        title: "Marketplace Bio",
        description: "Refonte complète de l'expérience utilisateur pour une place de marché dédiée aux produits biologiques et locaux.",
        longDescription: "Refonte UX/UI complète d'une marketplace de produits biologiques et locaux. Mise en place d'un système de recommandation intelligent, d'un processus de commande simplifié et d'une interface vendeur intuitive pour les producteurs locaux.",
        category: "E-Commerce",
        icon: ShoppingBag,
        techStack: ["Next.js", "Stripe", "Supabase", "Tailwind CSS", "Vercel"],
        results: [
            "+120% de conversion",
            "200+ producteurs locaux intégrés",
            "Temps de chargement < 1.5s"
        ]
    }
];

export default function ProjectDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const project = projects.find(p => p.slug === slug);

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans">
                <h1 className="text-4xl font-bold mb-4">Projet introuvable</h1>
                <p className="text-gray-500 mb-8">Ce projet n&apos;existe pas ou a été déplacé.</p>
                <Link href="/portfolio" className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                    Retour au portfolio
                </Link>
            </div>
        );
    }

    const Icon = project.icon;

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans">

            {/* Header */}
            <header className="w-full px-8 md:px-16 py-6 flex justify-between items-center z-10">
                <Link href="/portfolio" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">RETOUR AU PORTFOLIO</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-grow px-8 md:px-16 lg:px-24 pb-16">
                <div className="max-w-5xl mx-auto">

                    {/* Hero Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">{project.category}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                            {project.title}
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-3xl leading-relaxed">
                            {project.longDescription}
                        </p>
                    </div>

                    {/* Image Placeholder */}
                    <div className="w-full aspect-video bg-gray-100 dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl mb-12 flex items-center justify-center">
                        <Icon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

                        {/* Tech Stack */}
                        <div className="p-8 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4">Technologies Utilisées</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech) => (
                                    <span key={tech} className="px-4 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="p-8 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4">Résultats Clés</h2>
                            <ul className="space-y-3">
                                {project.results.map((result, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ArrowUpRight className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{result}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link href="/audit" className="inline-flex items-center gap-3 px-10 py-5 text-lg font-medium text-white bg-black dark:bg-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:shadow-xl hover:-translate-y-0.5">
                            Lancer un audit pour votre projet
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
