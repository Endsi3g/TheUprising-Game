'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Share2, MessageSquare, Heart, Bookmark, ChevronRight } from 'lucide-react';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Helper to find post data (in real app, this would be a fetch)
    const post = {
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category: "Intelligence Artificielle",
        date: "12 Mars 2026",
        author: "Kael - Creative Director",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
        content: `
            <p className="text-xl leading-relaxed mb-6 font-medium text-gray-700 dark:text-gray-300">
                L'intelligence artificielle n'est plus une promesse lointaine pour les entreprises québécoises ; elle est devenue le moteur principal de la transformation numérique en 2026.
            </p>
            <h2 className="text-3xl font-bold mt-12 mb-6">Un tournant technologique majeur</h2>
            <p className="mb-6 leading-relaxed">
                Depuis l'avènement des modèles multimodaux ultra-rapides, nous voyons une adoption sans précédent dans des secteurs traditionnels comme la construction et la restauration. Les entrepreneurs ne demandent plus "pourquoi ?", mais "comment ?".
            </p>
            <blockquote className="border-l-4 border-orange-500 pl-6 my-10 italic text-2xl text-gray-600 dark:text-gray-400">
                "La véritable force de l'IA en 2026 ne réside pas dans sa capacité à remplacer l'humain, mais dans son aptitude à libérer le talent créatif des tâches répétitives."
            </blockquote>
            <h2 className="text-3xl font-bold mt-12 mb-6">Trois piliers pour votre stratégie</h2>
            <p className="mb-4 leading-relaxed">
                Pour réussir votre intégration, vous devez vous concentrer sur trois axes fondamentaux :
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-3">
                <li><strong>La qualité des données :</strong> Votre IA n'est aussi performante que les informations que vous lui donnez.</li>
                <li><strong>L'expérience utilisateur :</strong> L'interface doit s'effacer au profit de l'interaction.</li>
                <li><strong>La souveraineté :</strong> Gardez le contrôle sur vos modèles et votre propriété intellectuelle.</li>
            </ul>
        `
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
            {/* Reading Progress Bar placeholder */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-[60]">
                <div className="h-full bg-orange-500 w-1/3"></div>
            </div>

            {/* Sticky Article Nav */}
            <header className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">
                        <ArrowLeft className="w-4 h-4" />
                        Blog
                    </Link>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><Share2 className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"><Bookmark className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24">
                <article className="max-w-4xl mx-auto px-6">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {post.category}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {post.date}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-tight">
                        {post.title}
                    </h1>

                    {/* Author Bar */}
                    <div className="flex items-center justify-between pb-10 border-b border-gray-100 dark:border-gray-800 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center font-bold text-lg">K</div>
                            </div>
                            <div>
                                <p className="font-bold text-sm">{post.author}</p>
                                <p className="text-xs text-gray-400">Directeur de Création, The Uprising Agency</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-50">
                            <span className="flex items-center gap-1.5 text-xs font-medium"><Heart className="w-4 h-4" /> 124</span>
                            <span className="flex items-center gap-1.5 text-xs font-medium"><MessageSquare className="w-4 h-4" /> 12</span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl">
                        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-orange">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Footer / CTA section */}
                    <div className="mt-20 p-10 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Cet article vous a plu ?</h3>
                            <p className="text-gray-500">Partagez vos impressions ou découvrez comment nous pouvons vous aider.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/game/audit" className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                Lancer un audit IA <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </article>

                {/* Related Posts simple list */}
                <section className="max-w-7xl mx-auto px-6 mt-32">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-extrabold">Continuer la lecture</h2>
                        <Link href="/blog" className="text-sm font-bold flex items-center gap-1 hover:text-orange-500 transition-colors">
                            Voir tout <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <Link key={i} href="/blog/another-post" className="group space-y-4">
                                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-white/5">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 group-hover:scale-110 transition-transform duration-500"></div>
                                </div>
                                <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors leading-tight">Pourquoi l'Automation Marketing change tout en 2026</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Digital Strategy</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-gray-800 text-center opacity-40 text-xs uppercase tracking-[0.2em]">
                © 2026 The Uprising Agency
            </footer>
        </div>
    );
}
