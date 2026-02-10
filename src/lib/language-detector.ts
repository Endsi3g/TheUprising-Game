import type { Language } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LangGuess {
    lang: Language;
    confidence: number;
}

export interface LanguageDetectionResult {
    detectedLang: Language;
    shouldSwitch: boolean;
    newSessionLang: Language;
    switchMessage?: string;
}

export interface LanguageDetectionState {
    history: LangGuess[];
    currentLang: Language;
    switchCount: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const WINDOW_SIZE = 3; // Sliding window of last N guesses
const SWITCH_THRESHOLD = 0.8; // Minimum confidence to consider a language switch
const MIN_VOTES = 2; // Minimum votes out of WINDOW_SIZE to trigger switch

// ─── Switch Messages ──────────────────────────────────────────────────────────

const SWITCH_MESSAGES: Record<Language, string> = {
    fr: 'Je vois que tu préfères le français, je continue en français. 🇫🇷',
    en: 'I see you prefer English, I\'ll continue in English. 🇬🇧',
};

// ─── Language Detector ────────────────────────────────────────────────────────

/**
 * Create a new language detection state for a session.
 */
export function createDetectionState(initialLang: Language): LanguageDetectionState {
    return {
        history: [],
        currentLang: initialLang,
        switchCount: 0,
    };
}

/**
 * Process a new language guess and determine if the session language should switch.
 *
 * Uses a sliding window approach:
 * - Keeps the last WINDOW_SIZE language guesses
 * - Switches only if ≥ MIN_VOTES of the window are in another language
 *   AND all those votes have confidence > SWITCH_THRESHOLD
 *
 * This prevents ping-pong switching on mixed-language input.
 */
export function processLanguageGuess(
    state: LanguageDetectionState,
    guess: LangGuess
): { result: LanguageDetectionResult; newState: LanguageDetectionState } {
    // Add guess to history, keep only last WINDOW_SIZE
    const updatedHistory = [...state.history, guess].slice(-WINDOW_SIZE);

    // Count votes for each language (only high-confidence guesses)
    const highConfGuesses = updatedHistory.filter((g) => g.confidence >= SWITCH_THRESHOLD);

    const frVotes = highConfGuesses.filter((g) => g.lang === 'fr').length;
    const enVotes = highConfGuesses.filter((g) => g.lang === 'en').length;

    // Determine if we should switch
    const otherLang: Language = state.currentLang === 'fr' ? 'en' : 'fr';
    const otherVotes = otherLang === 'fr' ? frVotes : enVotes;
    const shouldSwitch = otherVotes >= MIN_VOTES;

    const newLang = shouldSwitch ? otherLang : state.currentLang;

    const newState: LanguageDetectionState = {
        history: updatedHistory,
        currentLang: newLang,
        switchCount: shouldSwitch ? state.switchCount + 1 : state.switchCount,
    };

    const result: LanguageDetectionResult = {
        detectedLang: guess.lang,
        shouldSwitch,
        newSessionLang: newLang,
        switchMessage: shouldSwitch ? SWITCH_MESSAGES[newLang] : undefined,
    };

    return { result, newState };
}

/**
 * Simple heuristic language detection for typed text.
 * Uses common French/English word patterns and character frequency.
 *
 * For production, consider using a dedicated library like 'franc' or 'cld3'.
 */
export function detectLanguageFromText(text: string): LangGuess {
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/);

    // Common French indicators
    const frIndicators = [
        'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
        'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux',
        'est', 'suis', 'sont', 'êtes', 'sommes', 'avez', 'avons', 'ont',
        'dans', 'pour', 'avec', 'sur', 'mais', 'aussi', 'très', 'bien',
        'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
        'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'comment', 'pourquoi',
        'bonjour', 'merci', 'oui', 'non', "c'est", "j'ai", "n'est",
        'peut', 'faire', 'plus', 'site', 'avoir', 'être',
    ];

    // Common English indicators
    const enIndicators = [
        'i', 'you', 'he', 'she', 'we', 'they', 'it', 'my', 'your',
        'the', 'a', 'an', 'is', 'are', 'am', 'was', 'were', 'been',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'can', 'could', 'should', 'may', 'might', 'must',
        'in', 'on', 'at', 'to', 'for', 'with', 'from', 'by',
        'this', 'that', 'these', 'those', 'what', 'how', 'why',
        'hello', 'thanks', 'yes', 'no', "it's", "i'm", "don't",
        'not', 'but', 'and', 'or', 'if', 'so', 'because',
        'want', 'need', 'like', 'think', 'know', 'make',
    ];

    // French-specific characters
    const frChars = /[éèêëàâäùûüôîïçœæ]/gi;
    const frCharMatches = (lower.match(frChars) || []).length;

    let frScore = 0;
    let enScore = 0;

    for (const word of words) {
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
        if (frIndicators.includes(cleanWord)) frScore++;
        if (enIndicators.includes(cleanWord)) enScore++;
    }

    // Boost French score for accented characters
    frScore += frCharMatches * 0.5;

    const total = frScore + enScore;
    if (total === 0) {
        // Cannot determine — default to slight French bias (salon context)
        return { lang: 'fr', confidence: 0.5 };
    }

    const frRatio = frScore / total;

    if (frRatio > 0.5) {
        return { lang: 'fr', confidence: Math.min(frRatio, 0.99) };
    } else {
        return { lang: 'en', confidence: Math.min(1 - frRatio, 0.99) };
    }
}
