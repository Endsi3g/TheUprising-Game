'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, ArrowLeft, ArrowRight, ArrowUpRight, Monitor, Smartphone, ShoppingBag } from 'lucide-react';

const projects = [
    {
        id: 1,
        title: "Plateforme E-Learning",
        description: "Une interface éducative intuitive conçue pour maximiser l'engagement des étudiants avec des parcours personnalisés.",
        category: "Web Design",
        icon: Monitor,
        delay: '0.1s'
    },
    {
        id: 2,
        title: "Dashboard Analytics IA",
        description: "Tableau de bord complet permettant de visualiser des données complexes traitées par intelligence artificielle en temps réel.",
        category: "SaaS B2B",
        icon: Smartphone,
        delay: '0.2s'
    },
    {
        id: 3,
        title: "Marketplace Bio",
        description: "Refonte complète de l'expérience utilisateur pour une place de marché dédiée aux produits biologiques et locaux.",
        category: "E-Commerce",
        icon: ShoppingBag,
        delay: '0.3s'
    }
];

import { useRef } from 'react';

export default function PortfolioPage() {
    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollPrev = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth * 0.8, behavior: 'smooth' });
        }
    };

    const scrollNext = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth * 0.8, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700">

            {/* Header */}
            <header className="w-full px-8 py-6 flex justify-between items-center z-10">
                <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">KIOSK v2.0</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-gray-500">Guide Interactif</p>
                        <p className="text-sm font-bold">Découvrez nos pépites</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col relative w-full h-full">
                {/* Background Blobs */}
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

                <div className="z-10 w-full h-full flex flex-col max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 pt-4 pb-8">

                    {/* Page Title & Navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Portfolio</span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                                Nos Projets & Réalisations
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={scrollPrev} aria-label="Previous project" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button onClick={scrollNext} aria-label="Next project" className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-lg">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Project Cards (Horizontal Scroll) */}
                    <div className="flex-grow relative overflow-hidden flex items-center">
                        <div ref={carouselRef} className="flex gap-8 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-2 pb-8 w-full h-full items-center">

                            {projects.map((project) => (
                                <div key={project.id} className="relative flex-shrink-0 w-[400px] md:w-[480px] lg:w-[600px] bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 snap-center group cursor-pointer">
                                    <div className="w-full aspect-video bg-gray-100 dark:bg-black/20 border-b border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                            <project.icon className="w-16 h-16 opacity-20" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full">{project.category}</span>
                                            <ArrowUpRight className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors w-5 h-5" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* View All Card */}
                            <div className="relative flex-shrink-0 w-[200px] md:w-[250px] bg-transparent border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer snap-center group h-[400px]">
                                <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-surface-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ArrowRight className="text-gray-400 w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Voir tout le catalogue</span>
                            </div>

                        </div>
                    </div>

                    {/* Footer Navigation */}
                    <div className="mt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6">
                        <Link href="/" className="group flex items-center gap-3 px-6 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors text-gray-900 dark:text-white">
                            <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center group-hover:border-black dark:group-hover:border-white transition-colors bg-white dark:bg-transparent">
                                <ArrowLeft className="text-sm w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">Retour à l'accueil</span>
                        </Link>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
