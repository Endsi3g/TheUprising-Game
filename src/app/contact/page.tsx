```javascript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, CheckCircle2, ArrowRight, Building2, User, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackAnalyticsEvent, trackServerEvent } from '@/lib/analytics-client';
import { CLIENT_ANALYTICS_EVENTS, FUNNEL_EVENTS } from '@/lib/analytics/events';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactSchema, type ContactInput } from '@/lib/validators';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting } // isSubmitting handles loading state automatically
    } = useForm<ContactInput>({
        resolver: zodResolver(ContactSchema),
        defaultValues: {
            projectType: 'audit',
            firstName: '',
            email: '',
            companyName: '',
            message: ''
        }
    });

    const projectType = watch('projectType');
    const firstName = watch('firstName'); // Watch firstName for the submitted state

    const onSubmit = async (data: ContactInput) => {
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to send message');

            setSubmitted(true);
            trackAnalyticsEvent(CLIENT_ANALYTICS_EVENTS.LEAD_CREATED, { source: 'contact_form', project_type: data.projectType });
            trackServerEvent(FUNNEL_EVENTS.LEAD_CREATED, {
                metadata: {
                    source: 'contact_form',
                    project_type: data.projectType,
                },
            });
            toast.success('Demande envoyée avec succès !');
        } catch {
            toast.error('Une erreur est survenue lors de l\'envoi.');
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-white dark:bg-surface-dark p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">C&apos;est en route, {firstName} !</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Nous avons bien reçu votre demande pour un projet de <span className="text-black dark:text-white font-bold capitalize">{projectType}</span>.
                            Notre équipe analyse votre profil et reviendra vers vous sous 24h.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Réponse sous</span>
                            <span className="text-sm font-bold">24 Heures</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Étape suivante</span>
                            <span className="text-sm font-bold">Appel Découverte</span>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl"
                    >
                        Retour sur le Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden">
            <PageHeader />
            
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20 dark:opacity-10">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[160px]" />
                <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[160px]" />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-12 md:py-24 relative">
                <div className="grid lg:grid-cols-[1fr,1.2fr] gap-20 items-center">

                    {/* Content Column */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest"
                            >
                                <Sparkles className="w-4 h-4" />
                                Parlons de votre projet
                            </motion.div>
                            <h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[0.9]">
                                Prêt à passer <br />au <span className="text-blue-600">niveau</span> supérieur ?
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                                Que vous soyez une startup en lancement ou un business établi, nous transformons vos audits en pipelines de croissance.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: Mail, title: "Envoyez un email", detail: "contact@theuprising-game.com" },
                                { icon: MessageSquare, title: "Support direct", detail: "Disponible du Lundi au Vendredi" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
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

                        {/* Testimonial card */}
                        <div className="p-10 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-6">
                            <p className="text-lg italic text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                &quot;L&apos;audit IA a changé notre vision de notre site web. On a doublé notre taux de conversion en 3 mois grâce à The Uprising.&quot;
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 border-2 border-transparent" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 dark:text-white">Marc Antoine</p>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ceo, TechMontreal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-surface-dark p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative z-10"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Votre Prénom
                                    </label>
                                    <input
                                        {...register('firstName')}
                                        type="text"
                                        placeholder="Jean"
                                        className={cn(
                                            "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium",
                                            errors.firstName ? "border-red-500 focus:border-red-500" : "focus:border-black dark:focus:border-white"
                                        )}
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3"/> {errors.firstName.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Votre Email
                                    </label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        placeholder="jean@uprising.studio"
                                        className={cn(
                                            "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium",
                                            errors.email ? "border-red-500 focus:border-red-500" : "focus:border-black dark:focus:border-white"
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3"/> {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Entreprise (Optionnel)
                                </label>
                                <input
                                    {...register('companyName')}
                                    type="text"
                                    placeholder="The Uprising Inc."
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all outline-none font-medium"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50">Type de Projet</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['audit', 'startup', 'portfolio', 'other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setValue('projectType', type as any)}
                                            className={cn(
                                                "px-4 py-3 rounded-2xl capitalize border-2 transition-all text-xs font-bold",
                                                projectType === type
                                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-lg scale-[1.05]'
                                                    : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                            )}
                                        >
                                            {type === 'other' ? 'Autre' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                    Parlez-nous de votre vision
                                </label>
                                <textarea
                                    {...register('message')}
                                    rows={4}
                                    placeholder="Quels sont vos objectifs ?"
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all outline-none resize-none font-medium",
                                        errors.message ? "border-red-500 focus:border-red-500" : "focus:border-black dark:focus:border-white"
                                    )}
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-xs font-bold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/> {errors.message.message}
                                    </p>
                                )}
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-5 bg-black dark:bg-white dark:text-black text-white rounded-[1.5rem] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? (
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
```
