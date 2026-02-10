'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle, Target, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { TENANT_ID } from '@/lib/config';
import { useAuth } from '@/hooks/use-auth';

interface OverviewData {
    total_sessions: number;
    completed_sessions: number;
    total_leads: number;
    conversion_rate: number;
    sessions_by_mode: Record<string, number>;
    recent_sessions: Array<{
        id: string;
        mode: string;
        niche: string;
        created_at: string;
        completed_at: string | null;
    }>;
}

export default function AdminOverviewPage() {
    const { user, session, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Auth Guard
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Data Fetch
    useEffect(() => {
        if (!user || !session) {
            if (!authLoading) setLoading(false);
            return;
        }

        fetch(`/api/admin/overview?tenantId=${TENANT_ID}`, {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        })
            .then((res) => {
                if (res.status === 401) throw new Error('Non autorisé');
                return res.json();
            })
            .then((json) => {
                if (json.error) setError(json.error);
                else setData(json);
            })
            .catch((err) => setError(err.message || 'Failed to load overview'))
            .finally(() => setLoading(false));
    }, [user, session]);

    if (authLoading || loading) return <DashboardSkeleton />;
    if (!user) return null; // Will redirect
    if (error) return <div className="p-8 text-center text-red-500 font-medium">❌ Erreur: {error}</div>;
    if (!data) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Vue d'ensemble</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Métriques temps réel pour votre kiosque Salon AI
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Sessions totales" value={data.total_sessions} icon={Users} color="text-indigo-600" />
                <KpiCard title="Sessions complètes" value={data.completed_sessions} icon={CheckCircle} color="text-emerald-600" />
                <KpiCard title="Leads capturés" value={data.total_leads} icon={Target} color="text-amber-500" />
                <KpiCard title="Taux conversion" value={`${data.conversion_rate}%`} icon={TrendingUp} color="text-rose-500" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Sessions */}
                <Card className="col-span-4 shadow-sm border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                    <CardHeader>
                        <CardTitle>Sessions récentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">ID</th>
                                        <th className="px-4 py-3">Mode</th>
                                        <th className="px-4 py-3">Niche</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data.recent_sessions || []).map((s) => (
                                        <tr key={s.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-medium font-mono text-xs text-gray-400">{s.id.substring(0, 8)}…</td>
                                            <td className="px-4 py-3"><ModeBadge mode={s.mode} /></td>
                                            <td className="px-4 py-3 font-medium">{s.niche || '—'}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {s.created_at ? new Date(s.created_at).toLocaleDateString('fr-CA') : '—'}
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge completed={!!s.completed_at} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Mode distribution */}
                <Card className="col-span-3 shadow-sm border-border-light dark:border-border-dark bg-white dark:bg-surface-dark">
                    <CardHeader>
                        <CardTitle>Sessions par mode</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(data.sessions_by_mode || {}).map(([mode, count]) => (
                                <div key={mode} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${getModeColor(mode)} bg-opacity-10 text-opacity-100`}>
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium capitalize">{mode}</span>
                                    </div>
                                    <span className="font-bold text-xl">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── Components ───────────────────────────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
    return (
        <Card className="shadow-sm border-border-light dark:border-border-dark bg-white dark:bg-surface-dark hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

function ModeBadge({ mode }: { mode: string }) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        startup: 'default',
        portfolio: 'secondary',
        audit: 'outline'
    };
    return <Badge variant={variants[mode] || 'secondary'} className="capitalize">{mode}</Badge>;
}

function StatusBadge({ completed }: { completed: boolean }) {
    return (
        <Badge variant={completed ? 'default' : 'secondary'} className={completed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}>
            {completed ? 'Complète' : 'En cours'}
        </Badge>
    );
}

function getModeColor(mode: string) {
    if (mode === 'startup') return 'bg-indigo-500 text-indigo-500';
    if (mode === 'portfolio') return 'bg-emerald-500 text-emerald-500';
    return 'bg-amber-500 text-amber-500';
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <Skeleton className="col-span-4 h-96 rounded-xl" />
                <Skeleton className="col-span-3 h-96 rounded-xl" />
            </div>
        </div>
    );
}
