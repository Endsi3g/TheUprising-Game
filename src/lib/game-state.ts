import type { SessionMode, Language, Niche, ConversationMessage, ReportJson } from '@/types/database';

// ─── Game State Types ─────────────────────────────────────────────────────────

export type GamePhase =
    | 'idle'
    | 'mode_select'
    | 'niche_select'
    | 'company_info'
    | 'conversation'
    | 'generating_report'
    | 'report_ready';

export interface GameState {
    phase: GamePhase;
    mode: SessionMode | null;
    niche: Niche | null;
    language: Language;
    companyName: string;
    siteUrl: string;
    conversation: ConversationMessage[];
    report: ReportJson | null;
    sessionId: string | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
}

export type GameAction =
    | { type: 'SELECT_MODE'; mode: SessionMode }
    | { type: 'SELECT_NICHE'; niche: Niche }
    | { type: 'SET_COMPANY_INFO'; companyName: string; siteUrl?: string }
    | { type: 'SET_LANGUAGE'; language: Language }
    | { type: 'START_CONVERSATION'; sessionId: string }
    | { type: 'ADD_USER_MESSAGE'; content: string }
    | { type: 'ADD_ASSISTANT_MESSAGE'; content: string }
    | { type: 'START_REPORT_GENERATION' }
    | { type: 'SET_REPORT'; report: ReportJson }
    | { type: 'SET_ERROR'; error: string | null }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_SESSION_ID'; sessionId: string }
<<<<<<< HEAD
    | { type: 'HYDRATE'; state: GameState }
    | { type: 'SET_INITIALIZED' }
=======
    | { type: 'RESTORE_STATE'; state: Partial<GameState> }
>>>>>>> origin/master
    | { type: 'RESET' };

// ─── Initial State ────────────────────────────────────────────────────────────

export const initialGameState: GameState = {
    phase: 'mode_select',
    mode: null,
    niche: null,
    language: 'fr',
    companyName: '',
    siteUrl: '',
    conversation: [],
    report: null,
    sessionId: null,
    isLoading: false,
    error: null,
    isInitialized: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SELECT_MODE':
            return {
                ...state,
                mode: action.mode,
                phase: 'company_info',
                error: null,
            };

        case 'SET_COMPANY_INFO':
            return {
                ...state,
                companyName: action.companyName,
                siteUrl: action.siteUrl ?? state.siteUrl,
                phase: 'niche_select',
            };

        case 'SELECT_NICHE':
            return {
                ...state,
                niche: action.niche,
                phase: 'conversation',
            };

        case 'SET_LANGUAGE':
            return { ...state, language: action.language };

        case 'START_CONVERSATION':
            return {
                ...state,
                sessionId: action.sessionId,
                phase: 'conversation',
            };

        case 'ADD_USER_MESSAGE':
            return {
                ...state,
                conversation: [
                    ...state.conversation,
                    { role: 'user', content: action.content, timestamp: new Date().toISOString() },
                ],
            };

        case 'ADD_ASSISTANT_MESSAGE':
            return {
                ...state,
                conversation: [
                    ...state.conversation,
                    { role: 'assistant', content: action.content, timestamp: new Date().toISOString() },
                ],
                isLoading: false,
            };

        case 'START_REPORT_GENERATION':
            return { ...state, phase: 'generating_report', isLoading: true };

        case 'SET_REPORT':
            return {
                ...state,
                report: action.report,
                phase: 'report_ready',
                isLoading: false,
            };

        case 'SET_ERROR':
            return { ...state, error: action.error, isLoading: false };

        case 'SET_LOADING':
            return { ...state, isLoading: action.loading };

        case 'SET_SESSION_ID':
            return { ...state, sessionId: action.sessionId };

<<<<<<< HEAD
        case 'HYDRATE':
            return {
                ...action.state,
                // Ensure we don't accidentally get stuck in loading state from a stale save
                isLoading: false,
                error: null,
                isInitialized: true,
            };

        case 'SET_INITIALIZED':
            return { ...state, isInitialized: true };
=======
        case 'RESTORE_STATE':
            return { ...state, ...action.state, isLoading: false, error: null };
>>>>>>> origin/master

        case 'RESET':
            return { ...initialGameState, isInitialized: true };

        default:
            return state;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getPhaseIndex(phase: GamePhase): number {
    const phases: GamePhase[] = ['mode_select', 'company_info', 'niche_select', 'conversation', 'generating_report', 'report_ready'];
    return phases.indexOf(phase);
}

export function getPhaseProgress(phase: GamePhase, conversationLength: number = 0): number {
    const baseProgress: Record<GamePhase, number> = {
        idle: 0,
        mode_select: 0,
        company_info: 20,
        niche_select: 40,
        conversation: 50, // Start of conversation
        generating_report: 90,
        report_ready: 100,
    };

    if (phase === 'conversation') {
        // Dynamic progress during conversation (50% to 90%)
        // Assumes typical conversation is ~10-14 messages
        const progress = 50 + Math.min(conversationLength * 3, 40);
        return Math.min(progress, 89);
    }

    return baseProgress[phase];
}

export function getPhaseLabel(phase: GamePhase, language: Language): string {
    const labels: Record<GamePhase, { fr: string; en: string }> = {
        idle: { fr: 'Accueil', en: 'Home' },
        mode_select: { fr: 'Choix du mode', en: 'Mode Selection' },
        company_info: { fr: 'Votre entreprise', en: 'Your Business' },
        niche_select: { fr: 'Votre secteur', en: 'Your Sector' },
        conversation: { fr: 'Conversation IA', en: 'AI Conversation' },
        generating_report: { fr: 'Génération du rapport', en: 'Report Generation' },
        report_ready: { fr: 'Votre rapport', en: 'Your Report' },
    };
    return labels[phase][language];
}
