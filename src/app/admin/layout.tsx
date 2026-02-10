import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Target, Building, BookOpen, Calendar, FileText, Settings, LogOut } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Admin Dashboard | Salon AI',
    description: 'Tableau de bord administrateur',
};

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { href: '/admin/sessions', icon: MessageSquare, label: 'Sessions' },
    { href: '/admin/leads', icon: Target, label: 'Leads' },
    { href: '/admin/tenants', icon: Building, label: 'Tenants' },
    { href: '/admin/best-practices', icon: BookOpen, label: 'Bonnes Pratiques' },
    { href: '/admin/events', icon: Calendar, label: 'Événements' },
    { href: '/admin/report', icon: FileText, label: 'Rapport B2B' },
];

import AdminGuard from '@/components/auth/AdminGuard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen font-sans bg-gray-50 dark:bg-background-dark text-gray-900 dark:text-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-background-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col fixed inset-y-0 z-50">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">S</span>
                            <div>
                                <h1 className="font-bold text-sm tracking-wide">SALON AI</h1>
                                <p className="text-[10px] text-gray-500 font-mono">ADMIN PANEL</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer User */}
                    <div className="p-4 border-t border-border-light dark:border-border-dark">
                        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 ml-64 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
