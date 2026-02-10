'use client';

import Link from 'next/link';
import { ArrowLeft, Rocket, CheckCircle, ArrowRight } from 'lucide-react';

export default function StartBusinessPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">

            {/* Header */}
            <header className="w-full px-12 py-8 flex justify-between items-center z-10">
                <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">RETOUR À L'ACCUEIL</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center relative px-4 sm:px-8">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>

                <div className="max-w-4xl w-full flex flex-col items-center space-y-12 z-10">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                            <Rocket className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                            Commencez votre aventure.
                        </h1>
                        <p className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Nous allons vous guider étape par étape pour transformer votre idée en une entreprise florissante avec l'aide de l'IA.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
                        {[
                            { title: 'Validation', desc: 'Analysez la viabilité de votre idée de marché.' },
                            { title: 'Business Plan', desc: 'Générez un plan complet et structuré.' },
                            { title: 'Lancement', desc: 'Obtenez votre checklist de démarrage personnalisée.' }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-2xl shadow-sm hover:shadow-md transition-all">
                                <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <Link href="/audit" className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-medium text-white transition-all duration-200 bg-black dark:bg-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 hover:shadow-2xl hover:-translate-y-1 mt-12" type="button">
                        <span>Lancer le guide interactif</span>
                        <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
