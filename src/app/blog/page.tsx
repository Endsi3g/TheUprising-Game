'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, ArrowRight, Calendar, User, Tag, ChevronRight } from 'lucide-react';

const categories = ['Digital', 'Intelligence Artificielle', 'Audit UX', 'Marketing', 'Business'];

const posts = [
    {
        id: 1,
        slug: 'futur-ia-quebec',
        title: "Le futur de l'IA au Québec : Opportunités pour 2026",
        excerpt: "Comment les entreprises locales peuvent tirer profit de la nouvelle vague d'IA générative pour booster leur productivité.",
        category: "Intelligence Artificielle",
        date: "12 Mars 2026",
        author: "Équipe Uprising",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 2,
        slug: 'importance-audit-ux',
        title: "Pourquoi un Audit UX est crucial pour votre conversion",
        excerpt: "Ne laissez pas de l'argent sur la table. Découvrez comment de petits changements d'interface peuvent doubler vos ventes.",
        category: "Audit UX",
        date: "10 Mars 2026",
        author: "Kael - Creative Director",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 3,
        slug: 'vendre-sa-boite-en-6-mois',
        title: "Vendre sa boîte en 6 mois : Le guide ultime",
        excerpt: "De l'évaluation à la clôture, les étapes clés pour préparer votre entreprise à une sortie réussie.",
        category: "Business",
        date: "05 Mars 2026",
        author: "The Strategist",
        image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop"
    },
    {
        id: 4,
        slug: 'marketing-automation-2026',
        title: "Automation Marketing : Ce qui change en 2026",
        excerpt: "L'emailing classique est mort. Bienvenue dans l'ère de l'hyper-personnalisation pilotée par l'IA.",
        category: "Marketing",
        date: "01 Mars 2026",
        author: "Growth Squad",
        image: "https://images.unsplash.com/photo-1551288049-bbbda536639a?q=80&w=800&auto=format&fit=crop"
    }
];

export default function BlogListingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Tous' || post.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans">
            {/* Header / Nav Section */}
            <header className="w-full bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6" />
                        <span className="text-xl font-bold tracking-tight">The Uprising <span className="text-orange-500">Blog</span></span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium opacity-70">
                        <Link href="/" className="hover:opacity-100 transition-opacity">Accueil</Link>
                        <Link href="/portfolio" className="hover:opacity-100 transition-opacity">Portfolio</Link>
                        <Link href="/game/audit" className="hover:opacity-100 transition-opacity">Audit AI</Link>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                {/* Hero / Intro */}
                <div className="max-w-3xl mb-16 space-y-6">
                    <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Inspiration & Stratégie</span>
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                        Propulser votre <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">croissance digitale.</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                        Analyses croisées, études de cas et conseils stratégiques pour les entrepreneurs qui visent le sommet.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center mb-12">
                    <div className="flex flex-wrap gap-2">
                        {['Tous', ...categories].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeCategory === cat
                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                                        : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-black dark:hover:border-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
                    {filteredPosts.map((post, idx) => (
                        <Link
                            href={`/blog/${post.slug}`}
                            key={post.id}
                            className={`group flex flex-col bg-white dark:bg-surface-dark rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-soft hover:shadow-hover transition-all duration-500 ${idx === 0 ? 'lg:col-span-2 lg:flex-row h-full' : ''}`}
                        >
                            <div className={`relative overflow-hidden ${idx === 0 ? 'lg:w-1/2 min-h-[300px]' : 'aspect-video'}`}>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                <div className="absolute top-6 left-6">
                                    <span className="px-4 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-8 lg:p-12 flex flex-col justify-between ${idx === 0 ? 'lg:w-1/2' : ''}`}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span>
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-bold leading-tight group-hover:text-orange-500 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center text-sm font-bold group-hover:translate-x-2 transition-transform">
                                    Lire l&apos;article <ChevronRight className="ml-1 w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">Aucun article trouvé</h3>
                        <p className="text-gray-500 mt-2">Essayez d&apos;autres mots-clés ou une autre catégorie.</p>
                    </div>
                )}

                {/* Newsletter Section */}
                <section className="mt-32 p-12 lg:p-20 bg-black dark:bg-white rounded-[3rem] text-white dark:text-black flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-500 rounded-full blur-[100px]" />
                    </div>
                    <div className="lg:w-3/5 space-y-6 z-10">
                        <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Ne manquez aucune pépite.</h2>
                        <p className="text-lg opacity-70 leading-relaxed max-w-xl">
                            Rejoignez plus de 5,000 entrepreneurs et recevez nos meilleurs audits et stratégies directement dans votre boîte mail. Chaque semaine. Uniquement du concret.
                        </p>
                    </div>
                    <div className="lg:w-2/5 w-full z-10">
                        <form className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="flex-grow px-6 py-4 rounded-2xl bg-white/10 dark:bg-black/5 border border-white/20 dark:border-black/10 focus:outline-none focus:border-white dark:focus:border-black transition-all text-lg"
                                required
                            />
                            <button className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group whitespace-nowrap">
                                S&apos;inscrire <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 opacity-40" />
                        <span className="text-sm font-medium opacity-40 tracking-widest uppercase">The Uprising Agency</span>
                    </div>
                    <p className="text-xs text-gray-400">© 2026 Tous droits réservés. L&apos;IA au service de votre talent.</p>
                </div>
            </footer>
        </div>
    );
}
