"use client";

import { useState } from 'react';
import type { ReportJson } from '@/types/database';
import { Download, Calendar } from 'lucide-react';

interface ReportDisplayProps {
    report: ReportJson;
    title?: string;
    iconColorClass?: string;
}

export function ReportDisplay({
    report,
    title = 'Votre rapport est prêt !',
    iconColorClass = 'bg-green-500'
}: ReportDisplayProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const response = await fetch('/api/game/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
            });

            if (!response.ok) {
                throw new Error(`PDF generation failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `uprising-report-${report.mode}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('[ReportDisplay] Failed to download PDF:', error);
            window.print(); // Fallback to print
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #report-content, #report-content * {
                        visibility: visible;
                    }
                    #report-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        color: black;
                        padding: 0;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div id="report-content" className="space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold font-display">{title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">{report.summary}</p>
                </div>

                <div className="grid gap-6">
                    {report.sections?.length ? (
                        report.sections.map((section, i) => (
                            <div key={i} className="p-8 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all break-inside-avoid">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                    <span className={`w-2 h-8 rounded-full ${iconColorClass}`} />
                                    {section.title}
                                </h3>
                                <ul className="space-y-4">
                                    {section.bullets.map((bullet, j) => (
                                        <li key={j} className="flex items-start gap-4 text-gray-700 dark:text-gray-300">
                                            <span className={`mt-2 w-1.5 h-1.5 rounded-full ${iconColorClass} flex-shrink-0 opacity-40`} />
                                            <span className="leading-relaxed">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                Aucune section disponible.
                            </p>
                        </div>
                    )}
                </div>

                {report.cta && (
                    <div className="text-center pt-8 p-10 bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl break-inside-avoid">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 max-w-lg mx-auto leading-tight">{report.cta}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 no-print">
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold shadow-sm disabled:opacity-50"
                            >
                                <Download className="w-5 h-5" />
                                {isDownloading ? 'Génération...' : 'Télécharger le PDF'}
                            </button>
                            <button
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all font-bold shadow-xl"
                            >
                                <Calendar className="w-5 h-5" />
                                Réserver mon appel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
