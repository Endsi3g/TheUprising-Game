'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, ArrowLeft, ArrowRight, ArrowUpRight, Monitor, Smartphone, ShoppingBag } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PortfolioBenefits } from '@/components/portfolio/PortfolioBenefits';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { FRAMER_PORTFOLIO_BENEFITS_URL } from '@/lib/config';

const projects = [
    {
        id: 1,
        slug: 'e-learning',
        title: "Plateforme E-Learning",
        description: "Une interface éducative intuitive conçue pour maximiser l'engagement des étudiants avec des parcours personnalisés.",
        category: "Web Design",
        icon: Monitor,
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200",
        color: "from-blue-500/20 to-indigo-500/20"
    },
    {
        id: 2,
        slug: 'analytics-ia',
        title: "Dashboard Analytics IA",
        description: "Tableau de bord complet permettant de visualiser des données complexes traitées par intelligence artificielle en temps réel.",
        category: "SaaS B2B",
        icon: Smartphone,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
        color: "from-purple-500/20 to-pink-500/20"
    },
    {
        id: 3,
        slug: 'marketplace-bio',
        title: "Marketplace Bio",
        description: "Refonte complète de l'expérience utilisateur pour une place de marché dédiée aux produits biologiques et locaux.",
        category: "E-Commerce",
        icon: ShoppingBag,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
        color: "from-green-500/20 to-emerald-500/20"
    }
];

export default function PortfolioPage() {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            // Add a small buffer (1px) to account for fractional pixel rendering differences
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const container = carouselRef.current;
            const scrollLeft = container.scrollLeft;
            const containerCenter = scrollLeft + container.clientWidth / 2;

            // Find current centered item
            const children = Array.from(container.children) as HTMLElement[];
            // Filter AnimatePresence artifacts if any, though usually direct children are what we want
            // The scroll container has AnimatePresence's children.
            // Wait, AnimatePresence renders children directly.
            // But checking children[0] which is AnimatePresence? No, AnimatePresence is not a DOM element?
            // Actually AnimatePresence returns children.
            // Let's assume container.children are the snap items.

            let closestDist = Infinity;
            let closestIndex = 0;

            children.forEach((child, index) => {
                const childCenter = child.offsetLeft + child.offsetWidth / 2;
                const dist = Math.abs(childCenter - containerCenter);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIndex = index;
                }
            });
<<<<<<< HEAD
            // Re-check scroll state after animation (approximate delay)
            setTimeout(checkScroll, 500);
=======

            // Calculate target index. If we are already centered, move to next.
            // If slightly off, move to the intuitive next/prev.
            // With snap-mandatory, we are always centered or moving to center.
            let targetIndex = direction === 'left' ? closestIndex - 1 : closestIndex + 1;

            // Boundary checks
            targetIndex = Math.max(0, Math.min(targetIndex, children.length - 1));

            const targetItem = children[targetIndex];
            if (targetItem) {
                const targetScroll = targetItem.offsetLeft - (container.clientWidth / 2) + (targetItem.offsetWidth / 2);
                container.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
>>>>>>> origin/master
        }
    };

    return (
        <div className="min-h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700">

            {/* Header */}
            <PageHeader>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portfolio</p>
                        <p className="text-sm font-black tracking-tight">Showcase v2.0</p>
                    </div>
                    <Link href="/contact" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                        Démarrer un projet
                    </Link>
                </div>
            </PageHeader>

            {/* Main Content */}
            <main className="flex-grow flex flex-col relative w-full overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-100/30 dark:bg-purple-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700"></div>

                <div className="z-10 w-full h-full flex flex-col max-w-[1920px] mx-auto px-8 md:px-16 lg:px-24 pt-12 pb-8">

                    {/* Page Title & Navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 block">Nos Réalisations</span>
                            <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tight leading-[0.8] mb-6">
                                Crafting <br />Digital <span className="text-gray-300 dark:text-gray-700">Icons</span>
                            </h1>
                        </motion.div>

                        <div className="flex gap-4 mb-2">
                            <button
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                className={cn(
                                    "w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-all duration-300",
                                    canScrollLeft ? "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-transparent active:scale-90" : "opacity-30 cursor-not-allowed"
                                )}
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                className={cn(
                                    "w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-all duration-300 shadow-xl",
                                    canScrollRight ? "hover:scale-105 active:scale-95" : "opacity-30 cursor-not-allowed"
                                )}
                            >
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Project Cards (Horizontal Scroll) */}
                    <div className="flex-grow relative w-full">
                        <div
                            ref={carouselRef}
                            onScroll={checkScroll}
                            className="flex gap-10 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-2 pb-12 w-full items-stretch"
                        >
                            <AnimatePresence>
                                {projects.map((project, idx) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="snap-center"
                                    >
<<<<<<< HEAD
                                        <Link
                                            href={`/portfolio/${project.slug}`}
                                            className="relative block flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[800px] bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-card-hover transition-all duration-500 group cursor-pointer h-full"
                                        >
                                            {/* Image container */}
                                            <div className="w-full aspect-[21/9] md:aspect-[16/8] relative overflow-hidden">
                                                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 z-10", project.color)} />
                                                <Image
                                                    src={project.image}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 600px, 800px"
                                                />
                                                <div className="absolute top-6 left-6 z-20">
                                                    <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-black/90 text-black dark:text-white rounded-xl backdrop-blur-md shadow-lg border border-white/20">
                                                        {project.category}
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                                                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                                                        <ArrowUpRight className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-10 md:p-14 space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{project.title}</h3>
                                                    <project.icon className="w-8 h-8 text-gray-200 dark:text-gray-800" />
                                                </div>
                                                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
                                                    {project.description}
                                                </p>
                                                <div className="pt-4 flex items-center gap-4 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group/link">
                                                    Voir le Case Study
                                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                                                </div>
                                            </div>
                                        </Link>
=======
                                        <ProjectCard project={project} />
>>>>>>> origin/master
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Enhanced View All Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: projects.length * 0.1 }}
                                className="snap-center"
                            >
                                <Link
                                    href="/catalogue"
                                    className="relative flex-shrink-0 w-[40vw] md:w-[300px] bg-transparent border-[3px] border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-500 cursor-pointer group h-full min-h-[500px]"
                                >
                                    <div className="w-24 h-24 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                        <LayoutGrid className="text-gray-400 w-10 h-10 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-center px-8">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Discovery</p>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Voir tout le catalogue</h4>
                                        <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full group-hover:w-20 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>

                        </div>
                    </div>

                    {/* Footer Progress & Back */}
                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-10 gap-8">
                        <Link href="/" className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 font-bold shadow-sm">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                            <span className="text-sm">Retour à l&apos;accueil</span>
                        </Link>
                        <div className="flex gap-4 items-center">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Navigate our work</p>
                            <div className="flex gap-3">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === 0 ? "w-12 bg-blue-600" : "w-3 bg-gray-200 dark:bg-gray-800")} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <PortfolioBenefits framerUrl={FRAMER_PORTFOLIO_BENEFITS_URL} />

                </div>
            </main>
        </div>
    );
}
