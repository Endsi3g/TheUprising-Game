import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Zap, Bug, Settings, Book, History } from 'lucide-react';

interface ChangeEntry {
    type: string;
    scope?: string;
    description: string;
}

interface Version {
    version: string;
    date: string;
    sections: {
        title: string;
        changes: string[];
    }[];
}

const TYPE_MAP: Record<string, { label: string; icon: any; color: string }> = {
    feat: { label: 'Nouveauté', icon: Sparkles, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    fix: { label: 'Correction', icon: Bug, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    refactor: { label: 'Amélioration', icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    chore: { label: 'Maintenance', icon: Settings, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20' },
    docs: { label: 'Info', icon: Book, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
};

function parseChangelog(content: string): Version[] {
    const versions: Version[] = [];
    const lines = content.split('\n');
    let currentVersion: Version | null = null;
    let currentSection: { title: string; changes: string[] } | null = null;

    for (const line of lines) {
        const versionMatch = line.match(/^## \[(.*?)\] - (.*?)$/);
        if (versionMatch) {
            if (currentVersion) versions.push(currentVersion);
            currentVersion = {
                version: versionMatch[1],
                date: versionMatch[2],
                sections: []
            };
            currentSection = null;
            continue;
        }

        const sectionMatch = line.match(/^### (.*?)$/);
        if (sectionMatch && currentVersion) {
            currentSection = {
                title: sectionMatch[1],
                changes: []
            };
            currentVersion.sections.push(currentSection);
            continue;
        }

        if (line.trim().startsWith('- ') && currentSection) {
            currentSection.changes.push(line.trim().substring(2));
        }
    }

    if (currentVersion) versions.push(currentVersion);
    return versions;
}

export default function ChangelogPage() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    let changelogContent = '';
    
    try {
        changelogContent = fs.readFileSync(changelogPath, 'utf8');
    } catch (err) {
        console.error('Failed to read changelog:', err);
        return (
            <div className="p-8 text-center">
                <p>Oups ! Impossible de charger l'historique des changements.</p>
                <Link href="/" className="text-blue-500 underline mt-4 inline-block">Retour à l'accueil</Link>
            </div>
        );
    }

    const versions = parseChangelog(changelogContent);

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700">
            <div className="max-w-3xl mx-auto px-6 py-12">
                
                {/* Header */}
                <div className="mb-12 space-y-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour à l'accueil
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl">
                            <History className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Quoi de neuf ?</h1>
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                        Découvrez l'évolution de votre application Salon AI. Ici, nous listons les nouveautés, les corrections et les améliorations au fur et à mesure que nous faisons grandir le projet.
                    </p>
                </div>

                {/* Legend / Simple explanation */}
                <div className="flex flex-wrap gap-4 mb-16 p-4 bg-gray-50 dark:bg-surface-dark/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {Object.entries(TYPE_MAP).map(([key, { label, icon: Icon, color }]) => (
                        <div key={key} className="flex items-center gap-2 text-xs font-medium">
                            <div className={`p-1.5 rounded-lg ${color}`}>
                                <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative space-y-16">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-800" />

                    {versions.map((v, i) => (
                        <div key={v.version} className="relative pl-12 group">
                            {/* Dot */}
                            <div className={`absolute left-0 top-1.5 w-10 h-10 rounded-full border-4 border-white dark:border-background-dark bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10 transition-colors ${i === 0 ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-110' : 'text-gray-400'}`}>
                                <span className="text-[10px] font-bold">{i === 0 ? 'NEW' : v.version.split('.')[1]}</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-2xl font-bold">Version {v.version}</h2>
                                    <span className="text-sm font-medium text-gray-400">{v.date}</span>
                                </div>

                                <div className="space-y-8">
                                    {v.sections.map((section) => {
                                        const typeKey = Object.keys(TYPE_MAP).find(k => section.title.toLowerCase().startsWith(k)) || 'feat';
                                        const { label, icon: Icon, color } = TYPE_MAP[typeKey] || TYPE_MAP.feat;

                                        return (
                                            <div key={section.title} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${color}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">{label}</h3>
                                                </div>
                                                <ul className="space-y-3 pl-8 relative">
                                                    {section.changes.map((change, idx) => (
                                                        <li key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed relative before:absolute before:left-[-16px] before:top-[10px] before:w-1.5 before:h-1.5 before:bg-gray-300 dark:before:bg-gray-700 before:rounded-full">
                                                            {change}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* End of history */}
                <div className="mt-24 pt-12 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-sm text-gray-400 mb-4">Et ce n'est que le début de l'aventure...</p>
                    <Link href="/" className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity">
                        Retour au Salon AI
                    </Link>
                </div>
            </div>
        </div>
    );
}
