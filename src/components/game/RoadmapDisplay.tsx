import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface RoadmapPhase {
    phase: string;
    duration: string;
    steps: string[];
}

interface RoadmapDisplayProps {
    roadmap?: RoadmapPhase[];
}

export function RoadmapDisplay({ roadmap }: RoadmapDisplayProps) {
    if (!roadmap || roadmap.length === 0) return null;

    return (
        <div className="space-y-8 mt-12">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Votre Roadmap de Lancement
                </h2>
            </div>

            <div className="relative border-l-2 border-blue-100 dark:border-blue-900/50 space-y-12 ml-3 md:ml-6 pl-8 md:pl-12 py-4">
                {roadmap.map((phase, i) => (
                    <div key={i} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[calc(2rem_+_1px)] md:-left-[calc(3rem_+_1px)] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-surface-dark group-hover:scale-125 transition-transform" />

                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {phase.phase}
                                </h3>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {phase.duration}
                                </div>
                            </div>

                            <ul className="grid gap-3">
                                {phase.steps.map((step, j) => (
                                    <li key={j} className="flex gap-3 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                {/* Arrow at bottom */}
                <div className="absolute -bottom-4 -left-[calc(1.25rem_+_1px)] md:-left-[calc(2.25rem_+_1px)] text-blue-200 dark:text-blue-900">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
            </div>
        </div>
    );
}
