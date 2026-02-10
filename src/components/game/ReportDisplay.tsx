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
                    <h2 className="text-3xl font-bold">{title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">{report.summary}</p>
                </div>

                <div className="grid gap-6">
                    {report.sections.map((section, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                <span className={`w-2 h-8 rounded-full ${iconColorClass}`} />
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.bullets.map((bullet, j) => (
                                    <li key={j} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <span className={`mt-2 w-1.5 h-1.5 rounded-full ${iconColorClass} flex-shrink-0 opacity-60`} />
                                        <span className="leading-relaxed">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {report.cta && (
                    <div className="text-center pt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 break-inside-avoid">
                        <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">{report.cta}</p>
                        <div className="flex justify-center gap-4 no-print">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium shadow-sm"
                            >
                                <Download className="w-5 h-5" />
                                Télécharger le PDF
                            </button>
                            <button
                                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium shadow-lg hover:translate-y-0.5"
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
