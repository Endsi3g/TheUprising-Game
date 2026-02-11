'use client';

import { useEffect, useState } from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { CatalogueItem } from '@/types/database';
import { PageHeader } from '@/components/layout/PageHeader';

export default function CataloguePage() {
    const [items, setItems] = useState<CatalogueItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/catalogue');
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch catalogue items', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto space-y-16 relative">
                <PageHeader>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Catalogue Premium
                    </div>
                </PageHeader>

                <div className="space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                        Exploration du <span className="text-gray-400 dark:text-gray-500">Catalogue</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                        Accédez à notre bibliothèque de ressources et templates optimisés par l&apos;IA.
                        Chaque élément est conçu pour booster votre acquisition client.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-[20rem] rounded-3xl bg-gray-200 dark:bg-gray-800" />
                        ))}
                    </div>
                ) : (
                    <BentoGrid className="gap-6">
                        {items.map((item, i) => (
                            <BentoGridItem
                                key={item.id}
                                title={item.title}
                                description={item.excerpt || item.description}
                                header={
                                    <div className="flex flex-1 w-full h-full min-h-[10rem] rounded-2xl bg-gray-100 dark:bg-black/40 overflow-hidden relative group">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <LayoutGrid className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
                                    </div>
                                }
                                icon={
                                    <div className="flex gap-2 mb-2">
                                        {item.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                }
                                className={i === 0 || i === 3 ? "md:col-span-2" : ""}
                                href={item.url}
                            />
                        ))}
                    </BentoGrid>
                )}

                {/* Footer CTA */}
                <div className="pt-12 text-center">
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl">
                        Besoin d&apos;un template sur mesure ?
                        <Sparkles className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
