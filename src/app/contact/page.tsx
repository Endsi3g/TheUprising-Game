'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowRight, Building2, User } from 'lucide-react';
import Link from 'next/link';

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
            toast.success('Message envoyé avec succès !');
        } catch (err) {
            toast.error('Une erreur est survenue lors de l\'envoi.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold">Merci {formData.firstName} !</h1>
                <p className="text-gray-500 max-w-md mx-auto">
                    Votre demande a été bien reçue. Notre équipe vous contactera dans les plus brefs délais pour discuter de votre projet de {formData.projectType}.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-black dark:bg-white dark:text-black text-white rounded-full font-semibold hover:opacity-90 transition-all"
                >
                    Retour à l'accueil
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold tracking-tight">Prêt à élever votre business ?</h1>
                        <p className="text-xl text-gray-500">
                            Que vous lanciez une startup ou que vous auditiez votre plateforme actuelle, nous sommes là pour transformer vos idées en réalité.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Email</h3>
                                <p className="text-gray-500">contact@theuprising-game.com</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Support Direct</h3>
                                <p className="text-gray-500">Disponible du Lundi au Vendredi</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <p className="italic text-gray-600 dark:text-gray-400">
                            "L'audit IA a changé notre vision de notre site web. On a doublé notre taux de conversion en 3 mois."
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100" />
                            <div>
                                <p className="font-bold text-sm">Marc Antoine</p>
                                <p className="text-xs text-gray-500">CEO, TechMontreal</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-background-dark p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                                <User className="w-4 h-4" /> Prénom
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="Votre prénom"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-black dark:ring-white transition-all outline-none"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="nom@exemple.com"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-black dark:ring-white transition-all outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold opacity-70 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Entreprise (Optionnel)
                        </label>
                        <input
                            type="text"
                            placeholder="Nom de votre entreprise"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-black dark:ring-white transition-all outline-none"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold opacity-70">Type de Projet</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['audit', 'startup', 'portfolio', 'other'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, projectType: type })}
                                    className={`px-4 py-3 rounded-xl capitalize border-2 transition-all text-sm font-medium ${formData.projectType === type
                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {type === 'other' ? 'Autre' : type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold opacity-70">Votre message</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Décrivez votre projet ou posez vos questions..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-black dark:ring-white transition-all outline-none resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        Envoyer la demande
                    </button>
                </form>
            </div>
        </div>
    );
}
