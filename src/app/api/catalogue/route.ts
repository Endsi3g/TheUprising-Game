import { NextResponse } from 'next/server';
import type { CatalogueItem } from '@/types/database';
import { createPublicClient } from '@/lib/supabase';

// Mock data until Supabase table is ready
const MOCK_CATALOGUE: CatalogueItem[] = [
    {
        id: 'uprising-template-hero-1',
        title: 'Uprising Hero Template',
        excerpt: 'Une landing page héroïque pour convertir vos visiteurs.',
        description: 'Ce template est conçu pour maximiser la conversion avec une section héro impactante, des preuves sociales et un appel à l\'action clair.',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        url: 'https://uprising.studio/templates/hero-1',
        tags: ['Landing Page', 'Conversion', 'Dark Mode'],
        date: '2023-10-25',
        featured: true
    },
    {
        id: 'saas-dashboard-kit',
        title: 'SaaS Dashboard Kit',
        excerpt: 'Le kit ultime pour démarrer votre SaaS.',
        description: 'Gagnez des semaines de développement avec ce kit UI complet pour dashboard SaaS, incluant authentification, facturation et gestion d\'équipe.',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
        url: 'https://uprising.studio/templates/saas-kit',
        tags: ['SaaS', 'Dashboard', 'React'],
        date: '2023-11-12'
    },
    {
        id: 'portfolio-minimal',
        title: 'Minimalist Portfolio',
        excerpt: 'Mettez en valeur votre travail sans distraction.',
        description: 'Un design épuré qui laisse toute la place à vos créations. Idéal pour les photographes, designers et architectes.',
        image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2555&auto=format&fit=crop',
        url: 'https://uprising.studio/templates/minimal-portfolio',
        tags: ['Portfolio', 'Minimalist', 'Creative'],
        date: '2023-09-15'
    },
    {
        id: 'ecommerce-booster',
        title: 'E-commerce Booster',
        excerpt: 'Augmentez vos ventes avec ce design optimisé.',
        description: 'Une boutique en ligne moderne et rapide, optimisée pour le SEO et l\'expérience utilisateur mobile.',
        image_url: 'https://images.unsplash.com/photo-1472851294608-4151050aa4b4?q=80&w=2670&auto=format&fit=crop',
        url: 'https://uprising.studio/templates/ecommerce',
        tags: ['E-commerce', 'Shopify', 'Sales'],
        date: '2023-12-01'
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    const hasSupabaseEnv =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasSupabaseEnv) {
        try {
            const supabase = createPublicClient();
            const table = process.env.CATALOGUE_TABLE || 'catalogue_items';
            let query = supabase.from(table).select('*');

            if (slug) {
                query = query.eq('id', slug);
            }
            if (id) {
                query = query.eq('id', id);
            }

            const { data, error } = await query;
            if (error) {
                console.error('[Catalogue] Supabase error:', error);
                return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
            }

            return NextResponse.json(data ?? []);
        } catch (error) {
            console.error('[Catalogue] Supabase unavailable, falling back to mock data.', error);
        }
    }

    let data = MOCK_CATALOGUE;

    if (slug) {
        data = data.filter(item => item.id === slug);
    }
    if (id) {
        data = data.filter(item => item.id === id);
    }

    return NextResponse.json(data);
}
