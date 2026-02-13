'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ArrowLeft, ChevronRight, Home } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Fragment } from 'react';

interface PageHeaderProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    // Map path segments to readable names (optional)
    const pathNames: Record<string, string> = {
        'game': 'Expérience',
        'catalogue': 'Catalogue',
        'portfolio': 'Portfolio',
        'contact': 'Contact',
        'audit': 'Audit IA',
        'startup': 'Démarrage',
        'admin': 'Administration',
    };

    return (
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
            <div className="container mx-auto px-4 md:px-8 py-4">
                <div className="flex flex-col space-y-4">

                    {/* Top Row: Logo & Breadcrumbs */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {/* Logo / Home Link */}
                            <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors group">
                                <LayoutGrid className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="font-semibold tracking-tight hidden sm:inline-block">Salon AI</span>
                            </Link>

                            {/* Divider */}
                            <div className="h-4 w-[1px] bg-border hidden sm:block"></div>

                            {/* Breadcrumbs */}
                            <Breadcrumb className="hidden sm:block">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/" className="flex items-center gap-1">
                                            <Home className="w-3 h-3" />
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />

                                    {paths.map((path, index) => {
                                        const href = `/${paths.slice(0, index + 1).join('/')}`;
                                        const isLast = index === paths.length - 1;
                                        const label = pathNames[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

                                        return (
                                            <Fragment key={path}>
                                                <BreadcrumbItem>
                                                    {isLast ? (
                                                        <BreadcrumbPage>{label}</BreadcrumbPage>
                                                    ) : (
                                                        <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                                                    )}
                                                </BreadcrumbItem>
                                                {!isLast && <BreadcrumbSeparator />}
                                            </Fragment>
                                        );
                                    })}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        {/* Right Side: Back Button or Actions */}
                        <div className="flex items-center gap-2">
                            {/* Mobile Back Button (only if deep navigation) */}
                            {paths.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="sm:hidden"
                                >
                                    <Link href="..">
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Retour
                                    </Link>
                                </Button>
                            )}
                            {children}
                        </div>
                    </div>

                    {/* Optional Header Content (Title/Desc) on Mobile/Desktop if provided */}
                    {(title || description) && (
                        <div className="pb-2 sm:hidden">
                            {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                            {description && <p className="text-muted-foreground text-sm">{description}</p>}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
