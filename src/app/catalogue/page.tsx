'use client';

import { useEffect, useState } from 'react';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid } from 'lucide-react';
import type { CatalogueItem } from '@/types/database';

export default function CataloguePage() {
    const [items, setItems] = useState<CatalogueItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch('/api/catalogue');
                const data = await res.json();
                setItems(data);
            } catch (error) {
                console.error('Failed to fetch catalogue items', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 to-neutral-500 dark:from-neutral-200 dark:to-neutral-500">
                        Nos Templates & Ressources
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Explorez notre collection de templates certifiés pour accélérer votre croissance.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-[18rem] rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <BentoGrid className="max-w-7xl mx-auto">
                        {items.map((item, i) => (
                            <BentoGridItem
                                key={item.id}
                                title={item.title}
                                description={item.description || item.excerpt}
                                header={
                                    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 overflow-hidden relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                }
                                icon={<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mb-2"><LayoutGrid className="h-4 w-4 text-blue-500" /></div>}
                                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                                href={item.url}
                            />
                        ))}

                        {/* Special "View All" Card */}
                        <BentoGridItem
                            title="Voir tout le catalogue"
                            isSpecial={true}
                            href="/catalogue/all" // Or external link if necessary
                        />
                    </BentoGrid>
                )}
            </div>
        </div>
    );
}
