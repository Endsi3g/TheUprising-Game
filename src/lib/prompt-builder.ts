import type {
    SessionMode,
    Language,
    Niche,
    ConversationMessage,
    TenantVoiceConfig,
} from '@/types/database';
import { getNichePrompt } from '@/data/templates/niches';
import { formatBestPracticesForPrompt } from '@/data/best-practices';

// ─── Voice Style Mappings ─────────────────────────────────────────────────────

const VOICE_STYLE_INSTRUCTIONS: Record<string, { fr: string; en: string }> = {
    friendly: {
        fr: 'Adopte un ton chaleureux, accessible et encourageant. Utilise des expressions positives. Sois comme un ami compétent qui veut sincèrement aider.',
        en: 'Use a warm, accessible and encouraging tone. Use positive expressions. Be like a competent friend who genuinely wants to help.',
    },
    corporate: {
        fr: 'Adopte un ton professionnel et structuré. Utilise un vocabulaire business. Sois direct et orienté résultats. Reste poli mais va droit au but.',
        en: 'Use a professional and structured tone. Use business vocabulary. Be direct and results-oriented. Stay polite but get to the point.',
    },
    premium: {
        fr: 'Adopte un ton haut de gamme et raffiné. Utilise un vocabulaire élégant sans être prétentieux. Fais sentir à la personne qu\'elle reçoit un service exclusif.',
        en: 'Use an upscale and refined tone. Use elegant vocabulary without being pretentious. Make the person feel they\'re receiving exclusive service.',
    },
    playful: {
        fr: 'Adopte un ton dynamique et fun. Utilise des emojis occasionnellement. Sois enthousiaste et motivant. Glisse des petites blagues ou références pop culture quand c\'est naturel.',
        en: 'Use a dynamic and fun tone. Use emojis occasionally. Be enthusiastic and motivating. Slip in small jokes or pop culture references when natural.',
    },
};

// ─── Mode Context Instructions ────────────────────────────────────────────────

const MODE_INSTRUCTIONS: Record<SessionMode, { fr: string; en: string }> = {
    startup: {
        fr: `--- RÔLE : MENTOR / CO-FONDATEUR ---
D'abord, tu dois COMPRENDRE avant de conseiller.
PHASE 1 : INVESTIGATION (3-5 questions)
- Pose des questions précises sur la vision, le budget, les peurs et les forces uniques de [Nom de l'entreprise].
- Ne donne PAS de plan tout de suite. Creuse les réponses.
- Cherche la "sauce secrète" du fondateur.

PHASE 2 : PLAN D'ACTION (Rapport final)
- Une fois que tu as une clarté totale, signale [READY_FOR_REPORT].`,
        en: `--- ROLE: MENTOR / CO-FOUNDER ---
First, you must UNDERSTAND before advising.
PHASE 1: INVESTIGATION (3-5 questions)
- Ask precise questions about vision, budget, fears, and unique strengths.
- Do NOT give a plan yet. Dig into the answers.
- Look for the founder's "secret sauce".

PHASE 2: ACTION PLAN (Final Report)
- Once you have total clarity, signal [READY_FOR_REPORT].`,
    },
    portfolio: {
        fr: `--- RÔLE : DIRECTEUR DE CRÉATION ---
PHASE 1 : EXTRACTION
- Tu dois extraire les "pépites" des projets passés.
- Demande des chiffres, des défis surmontés, et l'impact réel.
- Ne te contente pas de généralités. Veux des preuves.

PHASE 2 : RÉDACTION
- Le but est de créer des études de cas irrésistibles.`,
        en: `--- ROLE: CREATIVE DIRECTOR ---
PHASE 1: EXTRACTION
- You must extract "nuggets" from past projects.
- Ask for numbers, challenges overcome, and real impact.
- Don't settle for generalities. Demand proof.

PHASE 2: COPYWRITING
- The goal is to create irresistible case studies.`,
    },
    audit: {
        fr: `--- RÔLE : EXPERT CRO / AUDITEUR ---
PHASE 1 : DIAGNOSTIC
- Agis comme un médecin. Pose des questions sur les symptômes (taux de conversion, trafic, plaintes clients).
- Demande quels sont les objectifs précis manqués.
- Ne propose pas de solutions avant d'avoir diagnostiqué le problème racine.

PHASE 2 : ORDONNANCE (Rapport)
- Prépare un plan de redressement clair.`,
        en: `--- ROLE: CRO EXPERT / AUDITOR ---
PHASE 1: DIAGNOSIS
- Act like a doctor. Ask about symptoms (conversion rates, traffic, customer complaints).
- Ask what specific goals are being missed.
- Do not propose solutions before diagnosing the root cause.

PHASE 2: PRESCRIPTION (Report)
- Prepare a clear turnaround plan.`,
    },
};

// ─── System Prompt Builder ────────────────────────────────────────────────────

/**
 * Builds the full system prompt for the LLM based on mode, niche, language,
 * optional audit context, voice config, and best practices.
 */
export function buildSystemPrompt(opts: {
    mode: SessionMode;
    niche: Niche;
    language: Language;
    auditHtmlSummary?: string;
    voiceConfig?: TenantVoiceConfig | null;
    includeBestPractices?: boolean;
}): string {
    const { mode, niche, language, auditHtmlSummary, voiceConfig, includeBestPractices = true } = opts;

    // --- Base persona ---
    const persona =
        language === 'fr'
            ? `Tu es un assistant IA conversationnel pour entrepreneurs. Tu parles français de manière chaleureuse, professionnelle et sans jargon technique. Tu vas droit au but tout en restant accueillant. Tu limites tes réponses à 3-7 échanges pour respecter le temps de la personne.`
            : `You are a conversational AI assistant for entrepreneurs. You speak English in a warm, professional way without technical jargon. You get to the point while staying welcoming. You limit your exchanges to 3-7 turns to respect the person's time.`;

    // --- Mode Context ---
    const modeContext = MODE_INSTRUCTIONS[mode]?.[language] || '';

    // --- Voice config ---
    let voiceInstructions = '';
    if (voiceConfig) {
        const styleInstr = VOICE_STYLE_INSTRUCTIONS[voiceConfig.voice_style];
        if (styleInstr) {
            voiceInstructions = `\n\n--- Style de communication ---\n${styleInstr[language]}`;
        }

        // Formality (FR only)
        if (language === 'fr') {
            voiceInstructions += voiceConfig.copy_tone.formality === 'tu'
                ? '\nTutoie la personne (utilise "tu", "ton", "ta").'
                : '\nVouvoie la personne (utilisez "vous", "votre").';
        }

        // Custom guidelines
        if (voiceConfig.copy_tone.guidelines) {
            voiceInstructions += `\n${language === 'fr' ? 'Instructions supplémentaires' : 'Additional guidelines'}: ${voiceConfig.copy_tone.guidelines}`;
        }

        // Sample phrases
        if (voiceConfig.copy_tone.sample_phrases?.length) {
            voiceInstructions += `\n${language === 'fr' ? 'Exemples de phrases à utiliser' : 'Sample phrases to use'}:\n${voiceConfig.copy_tone.sample_phrases.map((p) => `  - "${p}"`).join('\n')}`;
        }
    }

    // --- Niche-specific prompt ---
    const nichePrompt = getNichePrompt(niche, mode, language);

    // --- Best practices ---
    let bestPracticesBlock = '';
    if (includeBestPractices && (mode === 'audit' || mode === 'portfolio')) {
        bestPracticesBlock = `\n\n${formatBestPracticesForPrompt(niche, language)}`;
    }

    // --- Gamification context ---
    const gamificationContext =
        language === 'fr'
            ? `\n\nAprès ta dernière question, une analyse sera effectuée. Des badges seront attribués et un score de maturité digitale (0-10) sera calculé. Informe naturellement la personne que tu vas lui révéler son score bientôt, sans être infantilisant.`
            : `\n\nAfter your last question, an analysis will be performed. Badges will be awarded and a digital maturity score (0-10) will be calculated. Naturally inform the person you'll reveal their score soon, without being condescending.`;

    // --- Output format instructions ---
    const outputFormat =
        language === 'fr'
            ? `Quand tu as assez d'informations pour construire une stratégie complète, indique dans ta réponse [READY_FOR_REPORT]. Le backend utilisera ensuite un appel séparé pour générer le rapport structuré. N'inclus PAS le JSON du rapport dans la conversation.`
            : `When you have enough information to build a full strategy, include [READY_FOR_REPORT] in your response. The backend will then use a separate call to generate the structured report. Do NOT include report JSON in conversation.`;

    // --- Audit context ---
    let auditContext = '';
    if (mode === 'audit' && auditHtmlSummary) {
        auditContext =
            language === 'fr'
                ? `\n\n--- Résumé du site analysé ---\n${auditHtmlSummary}\n--- Fin du résumé ---\nUtilise ce résumé pour formuler un audit précis et concret.`
                : `\n\n--- Analyzed site summary ---\n${auditHtmlSummary}\n--- End of summary ---\nUse this summary to formulate a precise and concrete audit.`;
    }

    return [persona, modeContext, voiceInstructions, nichePrompt, bestPracticesBlock, gamificationContext, outputFormat, auditContext]
        .filter(Boolean)
        .join('\n\n');
}

/**
 * Builds the final report generation prompt.
 * Called when the session is being completed.
 */
export function buildReportPrompt(opts: {
    mode: SessionMode;
    niche: Niche;
    language: Language;
    conversation: ConversationMessage[];
    auditHtmlSummary?: string;
}): string {
    const { mode, niche, language, conversation, auditHtmlSummary } = opts;

    const conversationText = conversation
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

    const lang = language === 'fr' ? 'français' : 'English';

    // Include best practices in report generation
    const bestPractices = formatBestPracticesForPrompt(niche, language);

    // Agency CTA Logic
    const agencyCtaInstruction = language === 'fr'
        ? `Le champ "cta" DOIT être une invitation irrésistible à passer à l'action avec l'agence "Uprising".\nExemple : "Prêt à implémenter ce plan ? Prenez rendez-vous avec l'agence Uprising pour accélérer votre croissance."\nNe propose PAS de le faire toi-même, renvoie vers l'agence.`
        : `The "cta" field MUST be an irresistible invitation to take action with "Uprising" agency.\nExample: "Ready to implement this plan? Book a call with Uprising Agency to accelerate your growth."\nDo NOT offer to do it yourself, refer to the agency.`;

    return `${language === 'fr' ? 'Génère' : 'Generate'} a structured report in ${lang} based on the following conversation.

Mode: ${mode}
Niche: ${niche}
Language: ${language}

Conversation:
${conversationText}

${bestPractices}

${auditHtmlSummary ? `Site analysis summary:\n${auditHtmlSummary}\n` : ''}

${agencyCtaInstruction}

${language === 'fr'
            ? `Réponds UNIQUEMENT avec un JSON valide au format suivant, sans texte avant ni après :`
            : `Respond ONLY with valid JSON in the following format, no text before or after:`
        }

{
  "mode": "${mode}",
  "language": "${language}",
  "sector": "[sector name]",
  "summary": "[executive summary paragraph]",
  "sections": [
    {
      "title": "[section title]",
      "bullets": ["[bullet 1]", "[bullet 2]", "..."]
    }
  ],
  "cta": "[call to action text focused on Uprising Agency]",
  "best_practices_used": ["[best practice that was referenced]", "..."]
}`;
}

/**
 * Formats conversation history for the LLM context.
 */
export function formatConversationHistory(
    messages: ConversationMessage[]
): Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> {
    return messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));
}
