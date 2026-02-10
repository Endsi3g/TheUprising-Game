import type { Niche, SessionMode, Language } from '@/types/database';

// ─── Niche Definition ─────────────────────────────────────────────────────────

export interface NicheDefinition {
    id: Niche;
    label: { fr: string; en: string };
    description: { fr: string; en: string };
    icon: string; // emoji for kiosk display
    prompts: Record<SessionMode, Record<Language, string>>;
    questions: Record<SessionMode, Record<Language, string[]>>;
}

// ─── 10 Niches ────────────────────────────────────────────────────────────────

export const NICHES: NicheDefinition[] = [
    {
        id: 'restauration',
        label: { fr: 'Restauration', en: 'Restaurant / Food Service' },
        description: {
            fr: 'Restaurants, traiteurs, food trucks, cafés',
            en: 'Restaurants, caterers, food trucks, cafés',
        },
        icon: '🍽️',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à lancer un projet dans la restauration au Québec. Concentre-toi sur le concept, le menu, l'emplacement, la clientèle cible et un plan d'action réaliste sur 6 mois. Sois concret et local.`,
                en: `You're helping an entrepreneur launch a restaurant project in Quebec. Focus on concept, menu, location, target audience and a realistic 6-month action plan. Be concrete and local.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio de cas de figure pour un professionnel de la restauration. Présente 3-5 mandats types avec contexte, problème, solution et résultats. Rends ça concret et impressionnant.`,
                en: `You're generating a mini-portfolio of case studies for a food service professional. Present 3-5 typical mandates with context, problem, solution and results. Make it concrete and impressive.`,
            },
            audit: {
                fr: `Tu audites le site web d'un restaurant ou d'un service alimentaire. Analyse l'efficacité du menu en ligne, la réservation, les photos, les avis, le SEO local et les appels à l'action.`,
                en: `You're auditing the website of a restaurant or food service. Analyze online menu effectiveness, booking, photos, reviews, local SEO and calls to action.`,
            },
        },
        questions: {
            startup: {
                fr: [
                    'Quel type de restaurant ou de service veux-tu lancer ?',
                    'Dans quel quartier ou ville vises-tu l\'ouverture ?',
                    'Quel est ton client idéal (travailleurs, familles, touristes) ?',
                    'Quel est ton budget d\'investissement initial ?',
                    'Quel est ton objectif pour les 6 premiers mois ?',
                ],
                en: [
                    'What type of restaurant or food service do you want to launch?',
                    'In which area or city are you targeting?',
                    'Who is your ideal customer (workers, families, tourists)?',
                    'What is your initial investment budget?',
                    'What is your goal for the first 6 months?',
                ],
            },
            portfolio: {
                fr: [
                    'Dans quel secteur de la restauration travailles-tu ?',
                    'Quels types de mandats fais-tu le plus souvent ?',
                    'Quels résultats tes clients apprécient le plus ?',
                    'As-tu un site ou une page principale ? Si oui, quelle URL ?',
                ],
                en: [
                    'What area of food service do you work in?',
                    'What types of projects do you do most often?',
                    'What results do your clients appreciate most?',
                    'Do you have a website or main page? If so, what URL?',
                ],
            },
            audit: {
                fr: [
                    'Quelle est l\'URL de ton site principal ?',
                    'Quel est l\'objectif de ton site (réservations, commandes, visibilité) ?',
                    'Qui est ton client idéal ?',
                    'Qu\'aimerais-tu améliorer en priorité ?',
                ],
                en: [
                    'What is your main website URL?',
                    'What is your website\'s goal (reservations, orders, visibility)?',
                    'Who is your ideal customer?',
                    'What would you like to improve first?',
                ],
            },
        },
    },
    {
        id: 'beaute',
        label: { fr: 'Beauté & Coiffure', en: 'Beauty & Hair' },
        description: {
            fr: 'Salons de coiffure, esthétique, spas, barbiers',
            en: 'Hair salons, esthetics, spas, barbers',
        },
        icon: '💇',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à lancer un salon de beauté ou de coiffure au Québec. Concentre-toi sur les services, la clientèle cible, l'emplacement, la différenciation et un plan d'action.`,
                en: `You're helping an entrepreneur launch a beauty or hair salon in Quebec. Focus on services, target audience, location, differentiation and an action plan.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un professionnel de la beauté. Présente 3-5 transformations ou mandats types avec contexte et résultats.`,
                en: `You're generating a mini-portfolio for a beauty professional. Present 3-5 transformations or typical projects with context and results.`,
            },
            audit: {
                fr: `Tu audites le site web d'un salon de beauté. Analyse la prise de rendez-vous en ligne, les photos avant/après, les avis, le SEO local et le branding.`,
                en: `You're auditing a beauty salon website. Analyze online booking, before/after photos, reviews, local SEO and branding.`,
            },
        },
        questions: {
            startup: {
                fr: [
                    'Quel type de salon veux-tu ouvrir (coiffure, esthétique, barbier, spa) ?',
                    'Quel quartier ou ville vises-tu ?',
                    'Quelle clientèle cible (femmes, hommes, ados, haut de gamme) ?',
                    'Quel est ton budget et ton objectif à 6 mois ?',
                ],
                en: [
                    'What type of salon do you want to open (hair, esthetics, barber, spa)?',
                    'What area or city are you targeting?',
                    'What target clientele (women, men, teens, high-end)?',
                    'What is your budget and 6-month goal?',
                ],
            },
            portfolio: {
                fr: [
                    'Quel est ton domaine de spécialité ?',
                    'Quels types de services offres-tu le plus souvent ?',
                    'Quels résultats impressionnent le plus tes clients ?',
                    'As-tu un site ou une page en ligne ?',
                ],
                en: [
                    'What is your specialty?',
                    'What types of services do you offer most?',
                    'What results impress your clients the most?',
                    'Do you have a website or online page?',
                ],
            },
            audit: {
                fr: [
                    'Quelle est l\'URL de ton site ?',
                    'Quel est l\'objectif principal de ton site (rendez-vous, visibilité, vente) ?',
                    'Qui est ton client idéal ?',
                    'Qu\'aimerais-tu changer ou améliorer ?',
                ],
                en: [
                    'What is your website URL?',
                    'What is your website\'s main goal (appointments, visibility, sales)?',
                    'Who is your ideal customer?',
                    'What would you like to change or improve?',
                ],
            },
        },
    },
    {
        id: 'construction',
        label: { fr: 'Construction & Rénovation', en: 'Construction & Renovation' },
        description: {
            fr: 'Entrepreneurs généraux, rénovation, toiture, plomberie',
            en: 'General contractors, renovation, roofing, plumbing',
        },
        icon: '🔨',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à se lancer en construction ou rénovation au Québec. Focus sur les licences RBQ, la spécialisation, le démarchage et un plan d'action.`,
                en: `You're helping an entrepreneur start a construction or renovation business in Quebec. Focus on RBQ licensing, specialization, prospecting and an action plan.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un entrepreneur en construction. Présente 3-5 projets types (avant/après) avec contexte et résultats concrets.`,
                en: `You're generating a mini-portfolio for a construction contractor. Present 3-5 typical projects (before/after) with context and concrete results.`,
            },
            audit: {
                fr: `Tu audites le site web d'un entrepreneur en construction. Analyse la crédibilité, les photos de projets, les témoignages, la soumission en ligne et le SEO local.`,
                en: `You're auditing a construction contractor website. Analyze credibility, project photos, testimonials, online quotes and local SEO.`,
            },
        },
        questions: {
            startup: {
                fr: [
                    'Quel type de travaux veux-tu offrir (résidentiel, commercial, rénovation, neuf) ?',
                    'As-tu déjà une licence RBQ ou es-tu en processus ?',
                    'Quelle zone géographique vises-tu ?',
                    'Quel est ton objectif d\'ici 12 mois ?',
                ],
                en: [
                    'What type of work do you want to do (residential, commercial, renovation, new)?',
                    'Do you already have an RBQ license or are you in the process?',
                    'What geographic area are you targeting?',
                    'What is your goal within 12 months?',
                ],
            },
            portfolio: {
                fr: [
                    'Quel est ton domaine principal (résidentiel, commercial, spécialité) ?',
                    'Quels types de projets réalises-tu le plus ?',
                    'Quels résultats tes clients apprécient le plus ?',
                    'As-tu un site web existant ?',
                ],
                en: [
                    'What is your main area (residential, commercial, specialty)?',
                    'What types of projects do you do most?',
                    'What results do your clients appreciate most?',
                    'Do you have an existing website?',
                ],
            },
            audit: {
                fr: [
                    'Quelle est l\'URL de ton site ?',
                    'Quel est ton objectif principal (soumissions, appels, visibilité) ?',
                    'Qui est ton client idéal ?',
                    'Qu\'aimerais-tu améliorer en priorité ?',
                ],
                en: [
                    'What is your website URL?',
                    'What is your main goal (quotes, calls, visibility)?',
                    'Who is your ideal customer?',
                    'What would you like to improve first?',
                ],
            },
        },
    },
    {
        id: 'immobilier',
        label: { fr: 'Immobilier', en: 'Real Estate' },
        description: {
            fr: 'Courtiers immobiliers, gestion locative, investissement',
            en: 'Real estate agents, property management, investment',
        },
        icon: '🏠',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à se lancer dans l'immobilier au Québec. Focus sur le permis de courtage, la niche (résidentiel, commercial, locatif), la prospection et un plan d'action.`,
                en: `You're helping an entrepreneur start in real estate in Quebec. Focus on brokerage licensing, niche (residential, commercial, rental), prospecting and an action plan.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un professionnel de l'immobilier. Présente 3-5 transactions ou mandats types avec les résultats.`,
                en: `You're generating a mini-portfolio for a real estate professional. Present 3-5 typical transactions or mandates with results.`,
            },
            audit: {
                fr: `Tu audites le site web d'un professionnel de l'immobilier. Analyse les fiches de propriétés, la génération de leads, les témoignages et le SEO local.`,
                en: `You're auditing a real estate professional website. Analyze property listings, lead generation, testimonials and local SEO.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type d\'immobilier t\'intéresse (résidentiel, commercial, locatif) ?', 'Dans quelle région vises-tu ?', 'As-tu déjà un permis de courtage ?', 'Quel est ton objectif à 12 mois ?'],
                en: ['What type of real estate interests you (residential, commercial, rental)?', 'What region are you targeting?', 'Do you already have a brokerage license?', 'What is your 12-month goal?'],
            },
            portfolio: {
                fr: ['Quelle est ta spécialité immobilière ?', 'Quels types de mandats réalises-tu ?', 'Quels résultats impressionnent le plus tes clients ?', 'As-tu un site web ?'],
                en: ['What is your real estate specialty?', 'What types of mandates do you handle?', 'What results impress your clients most?', 'Do you have a website?'],
            },
            audit: {
                fr: ['Quelle est l\'URL de ton site ?', 'Quel est ton objectif principal ?', 'Qui est ton client idéal ?', 'Qu\'aimerais-tu améliorer ?'],
                en: ['What is your website URL?', 'What is your main goal?', 'Who is your ideal customer?', 'What would you like to improve?'],
            },
        },
    },
    {
        id: 'sante',
        label: { fr: 'Santé & Bien-être', en: 'Health & Wellness' },
        description: {
            fr: 'Cliniques, massothérapeutes, nutritionnistes, psychologues',
            en: 'Clinics, massage therapists, nutritionists, psychologists',
        },
        icon: '🏥',
        prompts: {
            startup: {
                fr: `Tu aides un professionnel de la santé à lancer sa pratique ou clinique au Québec. Focus sur les certifications, la spécialisation, la clientèle et un plan d'action.`,
                en: `You're helping a health professional launch their practice or clinic in Quebec. Focus on certifications, specialization, clientele and an action plan.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un professionnel de la santé. Présente 3-5 cas types (respectant la confidentialité) avec approche et résultats.`,
                en: `You're generating a mini-portfolio for a health professional. Present 3-5 typical cases (respecting confidentiality) with approach and results.`,
            },
            audit: {
                fr: `Tu audites le site web d'un professionnel de la santé. Analyse la prise de rendez-vous, la crédibilité, les certifications affichées et la confiance.`,
                en: `You're auditing a health professional website. Analyze appointment booking, credibility, displayed certifications and trust.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type de service de santé veux-tu offrir ?', 'As-tu les certifications nécessaires ?', 'Quelle clientèle vises-tu ?', 'Quel est ton objectif à 6 mois ?'],
                en: ['What type of health service do you want to offer?', 'Do you have the necessary certifications?', 'What clientele are you targeting?', 'What is your 6-month goal?'],
            },
            portfolio: {
                fr: ['Quelle est ta spécialité ?', 'Quels types de cas traites-tu le plus ?', 'Quels résultats apprécient le plus tes patients ?', 'As-tu un site web ?'],
                en: ['What is your specialty?', 'What types of cases do you treat most?', 'What results do your patients appreciate most?', 'Do you have a website?'],
            },
            audit: {
                fr: ['Quelle est l\'URL de ton site ?', 'Quel est ton objectif (rendez-vous, confiance, visibilité) ?', 'Qui est ton patient idéal ?', 'Qu\'aimerais-tu améliorer ?'],
                en: ['What is your website URL?', 'What is your goal (appointments, trust, visibility)?', 'Who is your ideal patient?', 'What would you like to improve?'],
            },
        },
    },
    {
        id: 'services_pro',
        label: { fr: 'Services Professionnels', en: 'Professional Services' },
        description: {
            fr: 'Comptables, avocats, notaires, consultants',
            en: 'Accountants, lawyers, notaries, consultants',
        },
        icon: '💼',
        prompts: {
            startup: {
                fr: `Tu aides un professionnel à lancer son cabinet ou sa pratique au Québec. Focus sur le positionnement, la clientèle cible, les défis réglementaires et un plan d'action.`,
                en: `You're helping a professional launch their firm or practice in Quebec. Focus on positioning, target clientele, regulatory challenges and an action plan.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un professionnel de services. Présente 3-5 mandats types.`,
                en: `You're generating a mini-portfolio for a service professional. Present 3-5 typical mandates.`,
            },
            audit: {
                fr: `Tu audites le site web d'un cabinet professionnel. Analyse la crédibilité, l'expertise affichée et la génération de leads.`,
                en: `You're auditing a professional firm website. Analyze credibility, displayed expertise and lead generation.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type de service professionnel offres-tu ?', 'Quelle est ta clientèle cible ?', 'Dans quelle région ?', 'Quel objectif à 12 mois ?'],
                en: ['What type of professional service do you offer?', 'What is your target clientele?', 'In what region?', 'What 12-month goal?'],
            },
            portfolio: {
                fr: ['Quel est ton domaine d\'expertise ?', 'Quels mandats réalises-tu le plus ?', 'Quels résultats tes clients apprécient ?', 'As-tu un site web ?'],
                en: ['What is your area of expertise?', 'What mandates do you handle most?', 'What results do your clients appreciate?', 'Do you have a website?'],
            },
            audit: {
                fr: ['Quelle est l\'URL de ton site ?', 'Quel est ton objectif principal ?', 'Quel client idéal ?', 'Quoi améliorer ?'],
                en: ['What is your website URL?', 'What is your main goal?', 'Who is your ideal client?', 'What to improve?'],
            },
        },
    },
    {
        id: 'marketing_web',
        label: { fr: 'Marketing & Web', en: 'Marketing & Web' },
        description: {
            fr: 'Agences marketing, design web, SEO, réseaux sociaux',
            en: 'Marketing agencies, web design, SEO, social media',
        },
        icon: '📱',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à lancer une agence marketing ou web au Québec. Focus sur la niche, les services, le pricing et l'acquisition de clients.`,
                en: `You're helping an entrepreneur launch a marketing or web agency in Quebec. Focus on niche, services, pricing and client acquisition.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour une agence marketing/web. Présente 3-5 campagnes ou projets avec métriques.`,
                en: `You're generating a mini-portfolio for a marketing/web agency. Present 3-5 campaigns or projects with metrics.`,
            },
            audit: {
                fr: `Tu audites le site web d'une agence marketing. Analyse la cohérence, le positionnement et l'effet "cordonnier mal chaussé".`,
                en: `You're auditing a marketing agency website. Analyze consistency, positioning and the "cobbler's shoes" effect.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type de services marketing/web veux-tu offrir ?', 'Quelle niche ou industrie vises-tu ?', 'Quel pricing envisages-tu ?', 'Objectif à 6 mois ?'],
                en: ['What type of marketing/web services do you want to offer?', 'What niche or industry are you targeting?', 'What pricing are you considering?', '6-month goal?'],
            },
            portfolio: {
                fr: ['Quels services offres-tu principalement ?', 'Quels types de campagnes/projets fais-tu ?', 'Quels résultats impressionnent tes clients ?', 'URL de ton site ?'],
                en: ['What services do you mainly offer?', 'What types of campaigns/projects do you do?', 'What results impress your clients?', 'Your website URL?'],
            },
            audit: {
                fr: ['URL de ton site ?', 'Objectif principal du site ?', 'Client idéal ?', 'Quoi améliorer ?'],
                en: ['Your website URL?', 'Main website goal?', 'Ideal client?', 'What to improve?'],
            },
        },
    },
    {
        id: 'ecommerce',
        label: { fr: 'E-commerce & Boutiques', en: 'E-commerce & Retail' },
        description: {
            fr: 'Boutiques en ligne, Shopify, vente au détail locale',
            en: 'Online stores, Shopify, local retail',
        },
        icon: '🛍️',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à lancer une boutique en ligne ou un commerce au Québec. Focus sur le produit, la plateforme, le marketing et la logistique.`,
                en: `You're helping an entrepreneur launch an online store or retail in Quebec. Focus on product, platform, marketing and logistics.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un e-commerçant. Présente 3-5 succès de vente avec métriques.`,
                en: `You're generating a mini-portfolio for an e-commerce entrepreneur. Present 3-5 sales successes with metrics.`,
            },
            audit: {
                fr: `Tu audites un site e-commerce. Analyse l'UX d'achat, les fiches produits, le panier, le processus de paiement et le SEO.`,
                en: `You're auditing an e-commerce website. Analyze purchase UX, product pages, cart, checkout and SEO.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quels produits veux-tu vendre ?', 'En ligne, physique ou les deux ?', 'Quelle plateforme envisages-tu (Shopify, WooCommerce) ?', 'Budget et objectif à 6 mois ?'],
                en: ['What products do you want to sell?', 'Online, physical or both?', 'What platform are you considering (Shopify, WooCommerce)?', 'Budget and 6-month goal?'],
            },
            portfolio: {
                fr: ['Quel type de produits vends-tu ?', 'Quels canaux de vente utilises-tu ?', 'Quels sont tes meilleurs résultats ?', 'URL de ta boutique ?'],
                en: ['What type of products do you sell?', 'What sales channels do you use?', 'What are your best results?', 'Your store URL?'],
            },
            audit: {
                fr: ['URL de ta boutique ?', 'Objectif principal (ventes, panier moyen, visibilité) ?', 'Client idéal ?', 'Quoi améliorer ?'],
                en: ['Your store URL?', 'Main goal (sales, avg cart, visibility)?', 'Ideal customer?', 'What to improve?'],
            },
        },
    },
    {
        id: 'coaching',
        label: { fr: 'Coaching & Formation', en: 'Coaching & Training' },
        description: {
            fr: 'Coaches de vie, formateurs, mentors, conférenciers',
            en: 'Life coaches, trainers, mentors, speakers',
        },
        icon: '🎯',
        prompts: {
            startup: {
                fr: `Tu aides un coach ou formateur à lancer son activité au Québec. Focus sur le positionnement, l'offre, le format et l'acquisition de clients.`,
                en: `You're helping a coach or trainer launch their business in Quebec. Focus on positioning, offer, format and client acquisition.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un coach/formateur. Présente 3-5 témoignages ou transformations.`,
                en: `You're generating a mini-portfolio for a coach/trainer. Present 3-5 testimonials or transformations.`,
            },
            audit: {
                fr: `Tu audites le site web d'un coach. Analyse la clarté de l'offre, la preuve sociale et le tunnel de conversion.`,
                en: `You're auditing a coach website. Analyze offer clarity, social proof and conversion funnel.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type de coaching ou formation offres-tu ?', 'Quel format (1-1, groupe, en ligne) ?', 'Quelle clientèle vises-tu ?', 'Objectif à 6 mois ?'],
                en: ['What type of coaching or training do you offer?', 'What format (1-1, group, online)?', 'What clientele are you targeting?', '6-month goal?'],
            },
            portfolio: {
                fr: ['Quelle est ta spécialité de coaching ?', 'Quels types de transformations génères-tu ?', 'Quels résultats impressionnent le plus ?', 'URL de ton site ?'],
                en: ['What is your coaching specialty?', 'What types of transformations do you generate?', 'What results impress the most?', 'Your website URL?'],
            },
            audit: {
                fr: ['URL de ton site ?', 'Objectif principal ?', 'Client idéal ?', 'Quoi améliorer ?'],
                en: ['Your website URL?', 'Main goal?', 'Ideal client?', 'What to improve?'],
            },
        },
    },
    {
        id: 'services_domicile',
        label: { fr: 'Services à Domicile', en: 'Home Services' },
        description: {
            fr: 'Ménage, entretien, paysagisme, déménagement',
            en: 'Cleaning, maintenance, landscaping, moving',
        },
        icon: '🏡',
        prompts: {
            startup: {
                fr: `Tu aides un entrepreneur à lancer un service à domicile au Québec. Focus sur la zone de service, les tarifs, la fiabilité et le bouche-à-oreille.`,
                en: `You're helping an entrepreneur launch a home service business in Quebec. Focus on service area, pricing, reliability and word-of-mouth.`,
            },
            portfolio: {
                fr: `Tu génères un mini-portfolio pour un fournisseur de services à domicile. Présente 3-5 interventions types.`,
                en: `You're generating a mini-portfolio for a home service provider. Present 3-5 typical interventions.`,
            },
            audit: {
                fr: `Tu audites le site web d'un service à domicile. Analyse la confiance, les avis, la couverture géographique et le processus de réservation.`,
                en: `You're auditing a home service website. Analyze trust, reviews, geographic coverage and booking process.`,
            },
        },
        questions: {
            startup: {
                fr: ['Quel type de service à domicile (ménage, paysagisme, déménagement) ?', 'Quelle zone géographique ?', 'Quel pricing envisages-tu ?', 'Objectif à 6 mois ?'],
                en: ['What type of home service (cleaning, landscaping, moving)?', 'What geographic area?', 'What pricing are you considering?', '6-month goal?'],
            },
            portfolio: {
                fr: ['Quel type de services offres-tu ?', 'Quels projets fais-tu le plus ?', 'Quels résultats tes clients apprécient ?', 'URL de ton site ?'],
                en: ['What type of services do you offer?', 'What projects do you do most?', 'What results do your clients appreciate?', 'Your website URL?'],
            },
            audit: {
                fr: ['URL de ton site ?', 'Objectif principal ?', 'Client idéal ?', 'Quoi améliorer ?'],
                en: ['Your website URL?', 'Main goal?', 'Ideal client?', 'What to improve?'],
            },
        },
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getNicheById(id: Niche): NicheDefinition | undefined {
    return NICHES.find((n) => n.id === id);
}

export function getNichePrompt(
    niche: Niche,
    mode: SessionMode,
    language: Language
): string {
    const def = getNicheById(niche);
    if (!def) return '';
    return def.prompts[mode][language];
}

export function getNicheQuestions(
    niche: Niche,
    mode: SessionMode,
    language: Language
): string[] {
    const def = getNicheById(niche);
    if (!def) return [];
    return def.questions[mode][language];
}
