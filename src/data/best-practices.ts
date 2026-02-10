import type { Niche, Language } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NicheBestPractices {
    recommended_ctas: { fr: string[]; en: string[] };
    essential_sections: { fr: string[]; en: string[] };
    offer_ideas: { fr: string[]; en: string[] };
    common_errors: { fr: string[]; en: string[] };
}

// ─── Best Practices per Niche ─────────────────────────────────────────────────

const BEST_PRACTICES: Record<Niche, NicheBestPractices> = {
    restauration: {
        recommended_ctas: {
            fr: [
                'Réservez votre table en ligne',
                'Commandez pour emporter',
                'Voir notre menu du jour',
                'Livraison gratuite à partir de 30$',
                'Réservez pour un événement privé',
            ],
            en: [
                'Book your table online',
                'Order for takeout',
                'See our daily menu',
                'Free delivery from $30',
                'Book a private event',
            ],
        },
        essential_sections: {
            fr: [
                'Menu avec photos et prix',
                'Système de réservation en ligne',
                'Horaires et emplacement (Google Maps)',
                'Galerie photos de l\'ambiance et des plats',
                'Avis Google et témoignages',
                'Événements spéciaux et promotions',
            ],
            en: [
                'Menu with photos and prices',
                'Online reservation system',
                'Hours and location (Google Maps)',
                'Photo gallery of ambiance and dishes',
                'Google reviews and testimonials',
                'Special events and promotions',
            ],
        },
        offer_ideas: {
            fr: [
                'Forfait traiteur pour événements (10-50 personnes)',
                'Menu dégustation 5 services',
                'Abonnement lunch box hebdomadaire',
                'Cours de cuisine privé avec le chef',
                'Carte cadeau digital',
            ],
            en: [
                'Catering package for events (10-50 people)',
                '5-course tasting menu',
                'Weekly lunch box subscription',
                'Private cooking class with the chef',
                'Digital gift card',
            ],
        },
        common_errors: {
            fr: [
                'Menu en PDF non lisible sur mobile',
                'Pas de photos professionnelles des plats',
                'Horaires non à jour',
                'Aucune option de réservation en ligne',
                'Avis Google non gérés (pas de réponse)',
                'Pas de fiche Google Business optimisée',
            ],
            en: [
                'PDF menu not readable on mobile',
                'No professional food photos',
                'Outdated hours',
                'No online reservation option',
                'Unmanaged Google reviews (no replies)',
                'No optimized Google Business listing',
            ],
        },
    },
    beaute: {
        recommended_ctas: {
            fr: [
                'Prenez rendez-vous en ligne',
                'Découvrez nos forfaits beauté',
                'Consultation gratuite',
                'Offrez une carte cadeau',
                'Voir nos transformations avant/après',
            ],
            en: [
                'Book your appointment online',
                'Discover our beauty packages',
                'Free consultation',
                'Give a gift card',
                'See our before/after transformations',
            ],
        },
        essential_sections: {
            fr: [
                'Liste des services avec tarifs',
                'Prise de rendez-vous en ligne (Fresha, Vagaro…)',
                'Photos avant/après',
                'Présentation de l\'équipe',
                'Avis clients et Google Reviews',
                'Promotions et offres spéciales',
            ],
            en: [
                'Service list with pricing',
                'Online booking (Fresha, Vagaro…)',
                'Before/after photos',
                'Team presentation',
                'Client reviews and Google Reviews',
                'Promotions and special offers',
            ],
        },
        offer_ideas: {
            fr: [
                'Forfait mariage (coiffure + maquillage + essai)',
                'Abonnement mensuel entretien (coupe + soin)',
                'Forfait transformation complète',
                'Carte fidélité (10e visite gratuite)',
                'Atelier beauté en groupe (EVJF, team building)',
            ],
            en: [
                'Wedding package (hair + makeup + trial)',
                'Monthly maintenance subscription (cut + treatment)',
                'Complete transformation package',
                'Loyalty card (10th visit free)',
                'Group beauty workshop (bachelorette, team building)',
            ],
        },
        common_errors: {
            fr: [
                'Pas de prise de rendez-vous en ligne',
                'Photos de mauvaise qualité ou stock photos',
                'Tarifs absents ou uniquement "sur demande"',
                'Aucune preuve sociale (0 avis)',
                'Site non adapté mobile',
                'Pas de lien direct vers Google Maps',
            ],
            en: [
                'No online appointment booking',
                'Low-quality or stock photos',
                'Pricing missing or "upon request" only',
                'No social proof (0 reviews)',
                'Non-mobile-friendly site',
                'No direct Google Maps link',
            ],
        },
    },
    construction: {
        recommended_ctas: {
            fr: ['Demandez une soumission gratuite', 'Appelez pour un estimé', 'Voir nos projets récents', 'Garantie écrite sur nos travaux', 'Consultation terrain gratuite'],
            en: ['Request a free quote', 'Call for an estimate', 'See our recent projects', 'Written warranty on our work', 'Free on-site consultation'],
        },
        essential_sections: {
            fr: ['Portfolio projets avant/après', 'Licences et assurances (RBQ)', 'Services par type de travaux', 'Témoignages clients', 'Zone de service', 'Formulaire de soumission'],
            en: ['Before/after project portfolio', 'Licenses and insurance (RBQ)', 'Services by work type', 'Client testimonials', 'Service area', 'Quote request form'],
        },
        offer_ideas: {
            fr: ['Inspection pré-achat immobilier', 'Forfait rénovation cuisine complète', 'Entretien saisonnier (toit, gouttières)', 'Plan d\'agrandissement 3D', 'Garantie prolongée'],
            en: ['Pre-purchase home inspection', 'Complete kitchen renovation package', 'Seasonal maintenance (roof, gutters)', '3D expansion plan', 'Extended warranty'],
        },
        common_errors: {
            fr: ['Aucune photo de projets réalisés', 'Numéro RBQ non visible', 'Pas de témoignages ou avis', 'Formulaire de contact cassé', 'Site lent ou non sécurisé', 'Zone de service non précisée'],
            en: ['No photos of completed projects', 'RBQ number not visible', 'No testimonials or reviews', 'Broken contact form', 'Slow or insecure site', 'Service area not specified'],
        },
    },
    immobilier: {
        recommended_ctas: {
            fr: ['Évaluez votre propriété gratuitement', 'Trouvez votre maison idéale', 'Consultation acheteur gratuite', 'Inscrivez-vous aux alertes propriétés', 'Planifiez une visite'],
            en: ['Get a free property valuation', 'Find your dream home', 'Free buyer consultation', 'Sign up for property alerts', 'Schedule a viewing'],
        },
        essential_sections: {
            fr: ['Fiches de propriétés avec photos HD', 'Outil de recherche avancée', 'Témoignages de clients', 'Bio du courtier avec certifications', 'Calculateur hypothécaire', 'Blog marché local'],
            en: ['Property listings with HD photos', 'Advanced search tool', 'Client testimonials', 'Agent bio with certifications', 'Mortgage calculator', 'Local market blog'],
        },
        offer_ideas: {
            fr: ['Analyse comparative de marché gratuite', 'Service clé en main vente+achat', 'Accompagnement premier acheteur', 'Staging virtuel HD', 'Vidéo drone propriété'],
            en: ['Free comparative market analysis', 'Full-service sell+buy package', 'First-time buyer guidance', 'Virtual HD staging', 'Drone property video'],
        },
        common_errors: {
            fr: ['Photos de mauvaise qualité', 'Fiches non à jour (vendu mais encore affiché)', 'Pas de zone de couverture claire', 'Aucun avis client', 'Pas de formulaire de contact visible', 'Bio trop longue ou absente'],
            en: ['Poor quality photos', 'Outdated listings (sold but still shown)', 'No clear coverage area', 'No client reviews', 'No visible contact form', 'Bio too long or missing'],
        },
    },
    sante: {
        recommended_ctas: {
            fr: ['Prenez rendez-vous en ligne', 'Consultation information gratuite', 'Voir nos services', 'Téléchargez notre guide santé', 'Appelez-nous directement'],
            en: ['Book an appointment online', 'Free info consultation', 'See our services', 'Download our health guide', 'Call us directly'],
        },
        essential_sections: {
            fr: ['Liste des services et approches', 'Prise de rendez-vous en ligne', 'Certifications et formations', 'Témoignages patients (conformes)', 'FAQ santé', 'Politique d\'annulation'],
            en: ['Services and approaches list', 'Online appointment booking', 'Certifications and training', 'Patient testimonials (compliant)', 'Health FAQ', 'Cancellation policy'],
        },
        offer_ideas: {
            fr: ['Bilan de santé complet', 'Forfait suivi mensuel', 'Atelier groupe bien-être', 'Programme 12 semaines', 'Consultation vidéo'],
            en: ['Comprehensive health assessment', 'Monthly follow-up package', 'Group wellness workshop', '12-week program', 'Video consultation'],
        },
        common_errors: {
            fr: ['Pas de prise de rendez-vous en ligne', 'Certifications non affichées', 'Jargon médical incompréhensible', 'Pas de témoignages', 'Site non conforme RAMQ/PEQ', 'Photos stock génériques'],
            en: ['No online booking', 'Certifications not displayed', 'Incomprehensible medical jargon', 'No testimonials', 'Non-compliant site', 'Generic stock photos'],
        },
    },
    services_pro: {
        recommended_ctas: {
            fr: ['Consultation initiale gratuite', 'Demandez un devis', 'Prenez rendez-vous', 'Téléchargez notre guide', 'Contactez un expert'],
            en: ['Free initial consultation', 'Request a quote', 'Book an appointment', 'Download our guide', 'Contact an expert'],
        },
        essential_sections: {
            fr: ['Services détaillés par domaine', 'Expertise et accréditations', 'Études de cas ou mandats réalisés', 'Tarification transparente', 'Blog ou ressources éducatives', 'Formulaire de contact professionnel'],
            en: ['Detailed services by area', 'Expertise and accreditations', 'Case studies or completed mandates', 'Transparent pricing', 'Blog or educational resources', 'Professional contact form'],
        },
        offer_ideas: {
            fr: ['Forfait démarrage entreprise', 'Audit fiscal annuel', 'Accompagnement conformité', 'Formation continue en entreprise', 'Consultation urgente prioritaire'],
            en: ['Business startup package', 'Annual tax audit', 'Compliance guidance', 'Continuing corporate training', 'Priority urgent consultation'],
        },
        common_errors: {
            fr: ['Jargon trop technique', 'Pas de tarifs affichés', 'Site daté (design 2010)', 'Aucune étude de cas', 'Pas de blog ou contenu', 'Bio trop corporative'],
            en: ['Too much technical jargon', 'No pricing displayed', 'Dated design (2010 look)', 'No case studies', 'No blog or content', 'Too corporate bio'],
        },
    },
    marketing_web: {
        recommended_ctas: {
            fr: ['Audit gratuit de votre site', 'Obtenez une stratégie sur mesure', 'Voir nos résultats', 'Démarrez votre projet', 'Réservez un appel découverte'],
            en: ['Free website audit', 'Get a custom strategy', 'See our results', 'Start your project', 'Book a discovery call'],
        },
        essential_sections: {
            fr: ['Portfolio de campagnes avec métriques', 'Services par spécialité', 'Processus de travail', 'Études de cas avec ROI', 'Témoignages clients', 'Blog SEO actif'],
            en: ['Campaign portfolio with metrics', 'Services by specialty', 'Work process', 'Case studies with ROI', 'Client testimonials', 'Active SEO blog'],
        },
        offer_ideas: {
            fr: ['Forfait lancement site + SEO 3 mois', 'Gestion réseaux sociaux mensuelle', 'Campagne Google Ads clés en main', 'Audit complet + plan d\'action', 'Formation marketing interne'],
            en: ['Website launch + 3-month SEO package', 'Monthly social media management', 'Turnkey Google Ads campaign', 'Full audit + action plan', 'Internal marketing training'],
        },
        common_errors: {
            fr: ['Cordonnier mal chaussé (site médiocre)', 'Pas de métriques dans le portfolio', 'Promesses vagues (nous boostons votre croissance)', 'Pas de processus clair', 'Blog inactif depuis des mois', 'Pas de spécialisation claire'],
            en: ['Cobbler\'s shoes (mediocre own site)', 'No metrics in portfolio', 'Vague promises (we boost your growth)', 'No clear process', 'Blog inactive for months', 'No clear specialization'],
        },
    },
    ecommerce: {
        recommended_ctas: {
            fr: ['Achetez maintenant', 'Livraison gratuite dès 50$', 'Ajoutez au panier', 'Nouveau: voir la collection', 'Inscrivez-vous pour 10% de rabais'],
            en: ['Buy now', 'Free shipping from $50', 'Add to cart', 'New: see the collection', 'Sign up for 10% off'],
        },
        essential_sections: {
            fr: ['Fiches produits avec photos multiples', 'Avis produits vérifiés', 'Processus d\'achat simple (3 étapes max)', 'Politique de retour claire', 'FAQ et guide des tailles', 'Trust badges (paiement sécurisé)'],
            en: ['Product pages with multiple photos', 'Verified product reviews', 'Simple checkout (3 steps max)', 'Clear return policy', 'FAQ and size guide', 'Trust badges (secure payment)'],
        },
        offer_ideas: {
            fr: ['Box mensuelle par abonnement', 'Bundle produits à prix réduit', 'Programme fidélité points', 'Éditions limitées saisonnières', 'Click & collect en boutique'],
            en: ['Monthly subscription box', 'Discounted product bundle', 'Points loyalty program', 'Seasonal limited editions', 'Click & collect in store'],
        },
        common_errors: {
            fr: ['Photos produit floues ou uniques', 'Pas d\'avis vérifiés', 'Checkout trop long (5+ étapes)', 'Frais de livraison cachés', 'Pas de politique de retour visible', 'Site lent (images non optimisées)'],
            en: ['Blurry or single product photos', 'No verified reviews', 'Too many checkout steps (5+)', 'Hidden shipping fees', 'No visible return policy', 'Slow site (unoptimized images)'],
        },
    },
    coaching: {
        recommended_ctas: {
            fr: ['Réservez votre séance découverte', 'Téléchargez mon guide gratuit', 'Rejoignez le programme', 'Transformez votre vie en 90 jours', 'Inscrivez-vous à la newsletter'],
            en: ['Book your discovery session', 'Download my free guide', 'Join the program', 'Transform your life in 90 days', 'Subscribe to the newsletter'],
        },
        essential_sections: {
            fr: ['Offres et programmes détaillés', 'Preuve sociale (témoignages vidéo)', 'Parcours et certifications du coach', 'FAQ et objections communes', 'Blog ou podcast', 'Page "à propos" authentique'],
            en: ['Detailed offers and programs', 'Social proof (video testimonials)', 'Coach journey and certifications', 'FAQ and common objections', 'Blog or podcast', 'Authentic about page'],
        },
        offer_ideas: {
            fr: ['Programme signature 12 semaines', 'Coaching VIP 1-1', 'Mastermind en groupe', 'Cours en ligne autonome', 'Retraite de fin de semaine'],
            en: ['12-week signature program', 'VIP 1-1 coaching', 'Group mastermind', 'Self-paced online course', 'Weekend retreat'],
        },
        common_errors: {
            fr: ['Offre vague (je vous accompagne)', 'Pas de preuve de résultats', 'Bio trop longue sans structure', 'Pas de lead magnet', 'Tunnel de vente inexistant', 'Trop de niches à la fois'],
            en: ['Vague offer (I support you)', 'No proof of results', 'Bio too long without structure', 'No lead magnet', 'No sales funnel', 'Too many niches at once'],
        },
    },
    services_domicile: {
        recommended_ctas: {
            fr: ['Demandez un devis gratuit', 'Réservez en ligne', 'Appelez maintenant', 'Voir nos tarifs', 'Satisfaction garantie ou remboursé'],
            en: ['Request a free estimate', 'Book online', 'Call now', 'See our pricing', 'Satisfaction guaranteed or refund'],
        },
        essential_sections: {
            fr: ['Services et tarifs clairs', 'Zone de couverture (carte)', 'Avis clients et notes Google', 'Photos avant/après', 'Assurances et garanties', 'Disponibilités et créneaux'],
            en: ['Services and clear pricing', 'Coverage area (map)', 'Client reviews and Google ratings', 'Before/after photos', 'Insurance and guarantees', 'Availability and time slots'],
        },
        offer_ideas: {
            fr: ['Forfait ménage hebdomadaire', 'Nettoyage après déménagement', 'Entretien saisonnier terrain', 'Service d\'urgence même jour', 'Abonnement mensuel tout inclus'],
            en: ['Weekly cleaning package', 'Post-move deep clean', 'Seasonal yard maintenance', 'Same-day emergency service', 'All-inclusive monthly subscription'],
        },
        common_errors: {
            fr: ['Pas de tarifs visibles', 'Zone de service floue', 'Aucune assurance affichée', 'Pas de photos de travaux', 'Pas de système de réservation', 'Aucun avis en ligne'],
            en: ['No visible pricing', 'Unclear service area', 'No insurance displayed', 'No work photos', 'No booking system', 'No online reviews'],
        },
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBestPractices(niche: Niche): NicheBestPractices {
    return BEST_PRACTICES[niche];
}

/**
 * Format best practices as a text block for LLM injection.
 */
export function formatBestPracticesForPrompt(
    niche: Niche,
    language: Language
): string {
    const bp = BEST_PRACTICES[niche];
    const lang = language === 'fr' ? 'fr' : 'en';

    const sections = [
        `${language === 'fr' ? 'CTA recommandés' : 'Recommended CTAs'}:\n${bp.recommended_ctas[lang].map((c) => `  - ${c}`).join('\n')}`,
        `${language === 'fr' ? 'Sections essentielles du site' : 'Essential website sections'}:\n${bp.essential_sections[lang].map((s) => `  - ${s}`).join('\n')}`,
        `${language === 'fr' ? 'Idées d\'offres / packs' : 'Offer / package ideas'}:\n${bp.offer_ideas[lang].map((o) => `  - ${o}`).join('\n')}`,
        `${language === 'fr' ? 'Erreurs fréquentes à vérifier' : 'Common errors to check'}:\n${bp.common_errors[lang].map((e) => `  - ${e}`).join('\n')}`,
    ];

    const header = language === 'fr'
        ? `--- Bonnes pratiques pour la niche "${niche}" ---`
        : `--- Best practices for "${niche}" niche ---`;

    return `${header}\n\n${sections.join('\n\n')}\n\n--- Fin des bonnes pratiques ---`;
}
