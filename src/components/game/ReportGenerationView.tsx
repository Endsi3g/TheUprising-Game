'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ReportGenerationView() {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    const statuses = [
        "Analyse de votre site web...",
        "Extraction des points clés...",
        "Génération des recommandations stratégiques...",
        "Optimisation de la structure du rapport...",
        "Finalisation du document PDF..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + (Math.random() * 5);
            });
        }, 1200);

        const statusInterval = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % statuses.length);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(statusInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto space-y-10 min-h-[400px]">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg"
                >
                    <Sparkles className="w-4 h-4 text-white dark:text-black" />
                </motion.div>
            </div>

            <div className="text-center space-y-4">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Génération du Géo-Audit
                </h3>
                <div className="h-8 overflow-hidden">
                    <motion.p
                        key={statusIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-gray-500 dark:text-gray-400 font-medium"
                    >
                        {statuses[statusIndex]}
                    </motion.p>
                </div>
            </div>

            <div className="w-full space-y-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Progression</span>
                    <span>{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-50 dark:bg-gray-800 rounded-full p-1 border border-gray-100 dark:border-gray-700">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Données collectées</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Rapport optimisé</span>
                </div>
            </div>
        </div>
    );
}
