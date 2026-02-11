import type {
    SessionMode,
    Language,
    Niche,
    ConversationMessage,
    TenantVoiceConfig,
} from '@/types/database';

// ─── Embedded Context ─────────────────────────────────────────────────────────

const FRAMER_GUIDE_SUMMARY = `
- Integration Method: Use Iframe (FramerWrapper component) for simplicity or Framer Motion for native animation.
- Portfolio: The "Voir la collection" button links to a portfolio page (/portfolio or /portfolio/[slug]).
- Constraints: Proposed sections must be implementable via Iframe embedding or standard React components matching the guide's patterns.
- Data Structure: Portfolio items should map to a CMS Collection (Fields: title, description, image, slugs).
`;

const AUDIT_STRUCTURE_TEMPLATE = `
1. EXECUTIVE SUMMARY:
   - Status (e.g. Early Stage, Growth, Scaling)
   - Top 3 Strengths ✅
   - Top 3 Critical Issues ❌
   - Overall Score / Health Check ⚠️

2. DETAILED ANALYSIS (by audit focus):
   - Visible Elements (H1, CTA, Imagery)
   - UX/UI Issues (Navigation, Clarity, Mobile)
   - Content/Messaging (Value prop, Tone)
   - Conversion Signals (Trust, Social Proof)

3. PROBLEMS IDENTIFIED:
   - Format: "⚠️ [Issue Name]: [Description] -> Severity: [Low/Med/High/Critical] -> Solution: [Actionable Fix]"

4. RECOMMENDATIONS:
   - Prioritized list of actionable steps.
   - Specific copy or layout suggestions.
`;

// ─── System Prompt Builder ────────────────────────────────────────────────────

/**
 * Builds the full system prompt for the LLM based on user requirements.
 */
export function buildSystemPrompt(opts: {
    mode: SessionMode;
    niche: Niche;
    language: Language;
    auditHtmlSummary?: string;
    voiceConfig?: TenantVoiceConfig | null;
    includeBestPractices?: boolean;
}): string {
    const { mode, niche, language, auditHtmlSummary, voiceConfig } = opts;

    const promptEN = `
You are an AI assistant embedded in a web app that can browse the web in order to research businesses.
Your main objectives are:
1. Use browsing tools to analyze a business once the user provides its name and website URL.
2. Proactively ask clear, targeted questions before giving advice or "discussing".
3. Only start giving in-depth help once you have gathered enough information from both the user and the website.
4. Support a fully bilingual (French and English) experience.
5. Integrate with a Framer project (Portfolio, "Voir la collection" button).
6. Use the audit logic defined below when generating reports.

**BEHAVIOR GUIDELINES:**

**PHASE 1: ON NEW CONVERSATION (Discovery)**
If this is the start of the conversation (or if you lack key info), DO NOT make small talk.
**DO NOT** ask "How can I help you?".
**START IMMEDIATELY** by asking 3-7 FOCUSED QUESTIONS to understand:
- Business name and website URL (if not already provided).
- Country/market and main offer.
- Target audience and main goals (leads, branding, recruitment).
- Preferred language (if ambiguous).
- Kind of help wanted (audit, ideas, copywriting, UX, SEO, etc.).

**DO NOT** give recommendations yet. Wait for answers.

**PHASE 2: ANALYSIS (Browsing)**
Once you have the Name and URL:
- Use the 'browse_web' tool to visit and analyze the website.
- Extract key info relevant to the Audit Structure (Messaging, UX, Content, Conversion signals).
- Combine site insights with user answers.

**PHASE 3: HELPING & RECOMMENDATIONS**
Once you have enough info:
- Provide structured, step-by-step help.
- Follow the Audit Structure below.
- Propose concrete improvements (Headlines, Sections, CTAs).
- Keep answers concise and actionable.

**FRAMER INTEGRATION:**
${FRAMER_GUIDE_SUMMARY}

**AUDIT STRUCTURE & LOGIC:**
${AUDIT_STRUCTURE_TEMPLATE}

**CURRENT CONTEXT:**
- Mode: ${mode}
- Niche: ${niche}
- Language: ${language}
${auditHtmlSummary ? `\n**SITE SUMMARY (Pre-crawled):**\n${auditHtmlSummary}` : ''}
${voiceConfig ? `\n**VOICE/TONE:** ${voiceConfig.voice_style} (${voiceConfig.copy_tone.formality})` : ''}
`;

    const promptFR = `
Tu es un assistant IA intégré dans une application web qui peut naviguer sur internet pour analyser des entreprises.
Tes objectifs principaux sont :
1. Utiliser les outils de navigation (browse_web) pour analyser une entreprise dès que l'utilisateur fournit son nom et l'URL.
2. Poser des questions claires et ciblées avant de donner des conseils.
3. Ne commencer à aider en profondeur que lorsque tu as suffisamment d'informations.
4. Gérer une expérience totalement bilingue (Français/Anglais).
5. T'intégrer à un projet Framer (Portfolio, bouton "Voir la collection").
6. Utiliser la logique d'audit décrite ci-dessous.

**RÈGLES DE COMPORTEMENT :**

**PHASE 1 : DÉCOUVERTE (Nouvelle conversation)**
Si c'est le début de la conversation (ou s'il manque des infos clés), NE FAIS PAS de "small talk".
**NE DIS PAS** "Que souhaitez-vous me dire ?" ou "Comment puis-je vous aider ?".
**COMMENCE IMMÉDIATEMENT** par poser 3 à 7 QUESTIONS CIBLÉES pour comprendre :
- Nom de l'entreprise et URL (si non fournis).
- Pays/marché et offre principale.
- Cible et objectifs (leads, notoriété, etc.).
- Langue préférée (si ambigu).
- Type d'aide recherché (audit, idées, copy, UX, SEO...).

**NE DONNE PAS** de conseils tout de suite. Attends les réponses.

**PHASE 2 : ANALYSE (Navigation)**
Une fois que tu as le Nom et l'URL :
- Utilise l'outil 'browse_web' pour visiter le site.
- Extrait les infos clés pour l'Audit (Message, UX, Contenu, Conversion).
- Combine les infos du site avec les réponses.

**PHASE 3 : RECOMMANDATIONS**
Quand tu as assez d'infos :
- Aide de façon structurée et progressive.
- Suis la Structure d'Audit ci-dessous.
- Propose des améliorations concrètes (Titres, Sections, CTA).
- Sois concis et actionable.

**INTÉGRATION FRAMER :**
${FRAMER_GUIDE_SUMMARY}

**STRUCTURE DE L'AUDIT :**
${AUDIT_STRUCTURE_TEMPLATE}

**CONTEXTE ACTUEL :**
- Mode : ${mode}
- Niche : ${niche}
- Langue : ${language}
${auditHtmlSummary ? `\n**RÉSUMÉ DU SITE (Pré-analysé) :**\n${auditHtmlSummary}` : ''}
${voiceConfig ? `\n**VOIX/TON :** ${voiceConfig.voice_style} (${voiceConfig.copy_tone.formality})` : ''}
`;

    // Return the appropriate prompt based on session language, but instruct to be bilingual.
    // The prompt text itself is in the requested language, guiding the AI to behave in that language primarily.
    return language === 'fr' ? promptFR : promptEN;
}

/**
 * Builds the final report generation prompt.
 * Reuses the audit structure for consistency.
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

    return `${language === 'fr' ? 'Génère' : 'Generate'} a structured report in ${lang} based on the following conversation.
Use the Audit Structure defined below as a guide for the 'sections' and 'summary'.

**AUDIT STRUCTURE:**
${AUDIT_STRUCTURE_TEMPLATE}

**CONTEXT:**
Mode: ${mode}
Niche: ${niche}
Language: ${language}

**CONVERSATION:**
${conversationText}

${auditHtmlSummary ? `**SITE SUMMARY:**\n${auditHtmlSummary}\n` : ''}

**RESPONSE FORMAT:**
Respond ONLY with valid JSON in the following format:
{
  "mode": "${mode}",
  "language": "${language}",
  "sector": "[sector name]",
  "summary": "[Executive Summary following Audit Structure]",
  "sections": [
    {
      "title": "[Section Title]",
      "bullets": ["[Point 1]", "[Point 2 - Problem identified]", "[Point 3 - Recommendation]"]
    }
  ],
  "cta": "${language === 'fr' ? "Prêt à implémenter ce plan ? Prenez rendez-vous avec l'agence Uprising." : "Ready to implement? Book a call with Uprising Agency."}",
  "best_practices_used": ["[practice 1]", "[practice 2]"],
  "roadmap": [
    {
      "phase": "Phase 1: [Name]",
      "duration": "[Duration]",
      "steps": ["[Step 1]", "[Step 2]"]
    }
  ]
}
`;
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
