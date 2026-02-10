'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, LayoutDashboard, Stethoscope, Utensils, Info } from 'lucide-react';
import { cn } from "@/lib/utils";
import Ai04 from "@/components/ai-04";

export default function AuditPage() {
    const [step, setStep] = useState(1);
    const [companyName, setCompanyName] = useState('');
    const [category, setCategory] = useState('');

    const handleNext = () => {
        if (companyName.trim()) {
            setStep(step + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleNext();
        }
    };

    const handleCategorySelect = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setStep(3);
    };

    const CategoryButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
        <button
            onClick={() => handleCategorySelect(label)}
            className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-surface-dark border-2 border-transparent hover:border-black dark:hover:border-white rounded-xl transition-all duration-200 group gap-4"
        >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-black selection:text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">Retour</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium tracking-wider uppercase opacity-60">Audit en cours</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex w-full h-full relative pt-20">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

                {step === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
                        {/* Left Column (Mascot removed, just text or placeholder) */}
                        <div className="col-span-5 flex items-center justify-center relative p-12 lg:p-16 border-r border-border-light bg-surface-light/30">
                            <div className="flex flex-col items-center">
                                <div className="mt-8 text-center opacity-40">
                                    <p className="text-sm font-mono uppercase tracking-widest">Assistant Audit v1.4</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Interaction) */}
                        <div className="col-span-7 flex flex-col justify-center px-16 lg:px-24 xl:px-32 relative bg-white">
                            <div className="max-w-2xl w-full mx-auto space-y-12">
                                <div className="flex items-start gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="relative bg-gray-100 p-8 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-xl">
                                        <div className="absolute -left-3 top-6 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-gray-100"></div>
                                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
                                            Bonjour ! Je suis votre assistant IA.<br />
                                            <span className="text-gray-500">Quel est le nom de votre entreprise ?</span>
                                        </h1>
                                    </div>
                                </div>

                                <div className="space-y-8 mt-12">
                                    <div className="relative group">
                                        <label className="sr-only" htmlFor="company-name">Nom de l'entreprise</label>
                                        <input
                                            autoFocus
                                            id="company-name"
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Votre entreprise..."
                                            className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-4 text-4xl md:text-5xl font-bold text-gray-900 placeholder-gray-300 focus:ring-0 focus:border-black transition-colors px-0"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Appuyez sur Entrée pour valider
                                        </p>
                                        <button
                                            onClick={handleNext}
                                            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-medium text-white transition-all duration-200 bg-black rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <span>Commencer l'audit</span>
                                            <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : step === 2 ? (
                    // Step 2 Content (Screen 4 from Frontend-App)
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                        <div className="w-full flex flex-col items-center space-y-10 z-10 max-w-7xl mx-auto">
                            <div className="flex items-end justify-center gap-6 mb-4">
                                <div className="pb-4">
                                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Audit IA</span>
                                    <h2 className="text-5xl font-bold text-gray-900 leading-none">Step 2</h2>
                                </div>
                            </div>

                            <div className="text-center max-w-3xl">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-snug">
                                    Quelle est votre activité principale <span className="text-indigo-600">{companyName}</span> ?
                                </h1>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-8">
                                <CategoryButton icon={Utensils} label="Restauration" />
                                <CategoryButton icon={Building2} label="Immobilier" />
                                <CategoryButton icon={Stethoscope} label="Santé" />
                                <CategoryButton icon={LayoutDashboard} label="Autre" />
                            </div>
                        </div>

                        <footer className="w-full px-8 py-8 flex flex-col items-center z-10 mt-auto">
                            <div className="w-full max-w-2xl flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                                    <span>Question 1 sur 5</span>
                                    <span>20%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-black h-full rounded-full transition-all duration-500 ease-out" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </footer>
                    </div>
                ) : (
                    // Step 3 Content: AI Audit Chat
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-4xl h-full flex flex-col">
                            <div className="flex-1 overflow-auto p-4">
                                <Ai04 onSubmit={(prompt) => console.log("Audit Prompt:", prompt)} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

