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
            ? `Quand tu as assez d'informations, indique dans ta réponse [READY_FOR_REPORT]. Le backend utilisera ensuite un appel séparé pour générer le rapport structuré. N'inclus PAS le JSON du rapport dans la conversation.`
            : `When you have enough information, include [READY_FOR_REPORT] in your response. The backend will then use a separate call to generate the structured report. Do NOT include report JSON in conversation.`;

    // --- Audit context ---
    let auditContext = '';
    if (mode === 'audit' && auditHtmlSummary) {
        auditContext =
            language === 'fr'
                ? `\n\n--- Résumé du site analysé ---\n${auditHtmlSummary}\n--- Fin du résumé ---\nUtilise ce résumé pour formuler un audit précis et concret.`
                : `\n\n--- Analyzed site summary ---\n${auditHtmlSummary}\n--- End of summary ---\nUse this summary to formulate a precise and concrete audit.`;
    }

    return [persona, voiceInstructions, nichePrompt, bestPracticesBlock, gamificationContext, outputFormat, auditContext]
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

    return `${language === 'fr' ? 'Génère' : 'Generate'} a structured report in ${lang} based on the following conversation.

Mode: ${mode}
Niche: ${niche}
Language: ${language}

Conversation:
${conversationText}

${bestPractices}

${auditHtmlSummary ? `Site analysis summary:\n${auditHtmlSummary}\n` : ''}

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
  "cta": "[call to action text]",
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
