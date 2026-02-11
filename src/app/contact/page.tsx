'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Mail,
    MessageSquare,
    Send,
    CheckCircle2,
    ArrowRight,
    Building2,
    User,
    Sparkles,
    Calendar,
    Clock,
} from 'lucide-react';
import { caseStudies } from '@/data/case-studies';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        email: '',
        companyName: '',
        projectType: 'audit',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to send message');
            setSubmitted(true);
            toast.success('Demande envoyee avec succes.');
        } catch {
            toast.error("Une erreur est survenue lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-white dark:bg-surface-dark p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            C&apos;est en route, {formData.firstName} !
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Votre demande a bien ete recue. Notre equipe revient vers vous sous 24h.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Reponse</span>
                            <span className="text-sm font-bold">24 heures</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Etape suivante</span>
                            <span className="text-sm font-bold">Appel decouverte</span>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl"
                    >
                        Retour a l&apos;accueil
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 md:py-24 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20 dark:opacity-10">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[160px]" />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-amber-500 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-7xl mx-auto px-8 relative">
                <div className="grid lg:grid-cols-[1fr,1.2fr] gap-20 items-center">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest"
                            >
                                <Sparkles className="w-4 h-4" />
                                Parlons de votre projet
                            </motion.div>
                            <h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[0.9]">
                                Pret a passer <br />au <span className="text-blue-600">niveau</span> superieur ?
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                                Startup en lancement ou business etabli: nous transformons vos audits en pipeline de croissance.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: Mail, title: 'Email', detail: 'contact@theuprising-game.com' },
                                { icon: MessageSquare, title: 'Support direct', detail: 'Lundi au vendredi' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-6 items-center group"
                                >
                                    <div className="w-14 h-14 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                                        <item.icon className="w-6 h-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{item.title}</h3>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{item.detail}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-10 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-5">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Case Studies</p>
                            <div className="space-y-4">
                                {caseStudies.map((study) => (
                                    <Link
                                        key={study.id}
                                        href={study.href}
                                        className="block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-4 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-black flex items-center justify-center">
                                                {study.logoText}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-gray-900 dark:text-white">{study.name}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                                    {study.industry} • {study.metric}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{study.quote}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-surface-dark p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative z-10"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Prenom
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Jean"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-black dark:focus:border-white transition-all outline-none font-medium"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="jean@uprising.studio"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-black dark:focus:border-white transition-all outline-none font-medium"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Entreprise (optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="The Uprising Inc."
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-black dark:focus:border-white transition-all outline-none font-medium"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50">Type de projet</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['audit', 'startup', 'portfolio', 'other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, projectType: type })}
                                            className={`px-4 py-3 rounded-2xl capitalize border-2 transition-all text-xs font-bold ${formData.projectType === type
                                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-lg scale-[1.05]'
                                                : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {type === 'other' ? 'autre' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50">Votre vision</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Quels sont vos objectifs ?"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-black dark:focus:border-white transition-all outline-none resize-none font-medium"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-[1.5rem] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Propulser la demande
                                        <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
