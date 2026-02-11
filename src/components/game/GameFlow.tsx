'use client';

import { useState, useRef, useEffect, useCallback, type ComponentType, type SVGProps } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/hooks/use-game';
import { getPhaseProgress, getPhaseLabel } from '@/lib/game-state';
import { Send, Mic, MicOff, Loader2, ArrowRight, Volume2, VolumeX, Smartphone, ImagePlus, X } from 'lucide-react';
import type { Niche } from '@/types/database';
import Avatar from '@/components/game/Avatar';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import { useTTS } from '@/hooks/use-tts';
import QRHandoff from '@/components/game/QRHandoff';
import { useAudioFeedback } from '@/hooks/use-audio-feedback';

// ─── Niche Selection Grid ─────────────────────────────────────────────────────

interface NicheOption {
    id: Niche;
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function NicheSelector({ niches, onSelect }: { niches: NicheOption[]; onSelect: (niche: Niche) => void }) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Quel est votre secteur d&apos;activité ?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    Cela nous permettra d&apos;adapter nos recommandations.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {niches.map((niche) => (
                    <button
                        key={niche.id}
                        onClick={() => onSelect(niche.id)}
                        title={`Sélectionner le secteur ${niche.label}`}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-gray-800 rounded-xl hover:border-black dark:hover:border-white transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <niche.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <span className="text-sm font-semibold text-center">{niche.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Company Info Form ────────────────────────────────────────────────────────

export function CompanyInfoForm({ mode, showSiteUrl, onSubmit }: { mode?: string; showSiteUrl?: boolean; onSubmit: (name: string, url?: string) => void }) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim(), url.trim() || undefined);
        }
    };

    const isStartup = mode === 'startup';

    return (
        <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {isStartup ? "Parlez-nous de votre projet" : "Parlez-nous de votre entreprise"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    {isStartup
                        ? "Commençons par le commencement. Comment s'appelle votre future licorne ?"
                        : "Dites-nous qui vous êtes pour que nous puissions analyser votre présence."}
                </p>
            </div>

            <div className="space-y-6 bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        {isStartup ? "Nom du projet" : "Nom de l'entreprise"}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isStartup ? "Ex: MyAwesomeStartup" : "Ex: Uprising Studio"}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl focus:outline-none transition-all text-lg"
                    />
                </div>

                {showSiteUrl && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                URL du site
                            </label>
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700 uppercase tracking-wider">Optionnel</span>
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://votre-site.com"
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-black dark:focus:border-white rounded-xl focus:outline-none transition-all text-lg"
                        />
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                        Continuer
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    {!name.trim() && (
                        <p className="text-center text-xs text-orange-500 mt-3 font-medium animate-pulse">
                            Veuillez renseigner le nom de votre projet pour continuer.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Conversation Panel ───────────────────────────────────────────────────────

export function ConversationPanel() {
    const { state, sendMessage } = useGame();
    const [input, setInput] = useState('');
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const appendTranscript = useCallback((capturedText: string) => {
        setInput((prev) => (prev ? `${prev} ${capturedText}` : capturedText));
    }, []);

    const { isRecording, isTranscribing, startRecording, stopRecording, error: voiceError } = useVoiceRecorder({
        onTranscript: appendTranscript,
    });
    const { speak, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();
    const [isSoundEnabled, setIsSoundEnabled] = useState(false); // Default off to avoid startling
    const [showQR, setShowQR] = useState(false);
    const lastAssistantIndexRef = useRef<number>(-1);
    const { play } = useAudioFeedback(isSoundEnabled);

    // Auto-scroll
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.conversation]);

    // Auto-TTS for new assistant messages
    useEffect(() => {
        const lastIndex = state.conversation.length - 1;
        const lastMsg = state.conversation[lastIndex];
        const isNewAssistantMessage =
            !!lastMsg &&
            lastMsg.role === 'assistant' &&
            lastAssistantIndexRef.current !== lastIndex;

        if (!isNewAssistantMessage) return;

        lastAssistantIndexRef.current = lastIndex;

        if (isSoundEnabled) {
            play('message-receive');
            stopTTS();
            speak(lastMsg.content);
        }
    }, [state.conversation, isSoundEnabled, play, speak, stopTTS]);

    const handleSend = async () => {
        if ((!input.trim() && !imageDataUrl) || state.isLoading) return;
        stopTTS(); // Stop speaking when user sends message
        play('message-send');
        const msg = input.trim() || 'Analyse cette capture d\'ecran.';
        setInput('');
        await sendMessage(msg, { imageDataUrl: imageDataUrl || undefined });
        setImageDataUrl(null);
        setImageName(null);
    };

    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;

        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
        });

        setImageDataUrl(dataUrl);
        setImageName(file.name);
    };

    const handleVoiceToggle = async () => {
        if (isTranscribing) return;

        if (isRecording) {
            stopRecording();
            play('record-stop');
            return;
        }

        await startRecording();
        play('record-start');
    };

    // Determine Avatar State
    const avatarState = isRecording
        ? 'listening'
        : isTTSPlaying
            ? 'speaking'
            : state.isLoading
                ? 'thinking'
                : 'idle';

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full relative">

            {/* Header Controls */}
            <div className="absolute top-2 right-2 flex gap-2 z-20">
                <button
                    onClick={() => setShowQR(!showQR)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors text-gray-500"
                    title="Continuer sur mobile"
                >
                    <Smartphone className="w-5 h-5" />
                </button>
                <button
                    onClick={() => {
                        if (isSoundEnabled) stopTTS();
                        const nextValue = !isSoundEnabled;
                        setIsSoundEnabled(nextValue);
                        if (nextValue) {
                            play('toggle-on');
                        }
                    }}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors text-gray-500"
                    title={isSoundEnabled ? "Couper le son" : "Activer le son"}
                >
                    {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>

            {/* QR Overlay */}
            {showQR && (
                <div className="absolute top-14 right-2 z-30 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 relative">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <QRHandoff />
                    </div>
                </div>
            )}

            {/* Avatar Header */}
            <div className="flex-shrink-0 flex justify-center py-4 bg-transparent z-10 transition-all duration-500" style={{ transform: isTTSPlaying ? 'scale(1.1)' : 'scale(1)' }}>
                <Avatar state={avatarState} className="w-32 h-32 md:w-40 md:h-40" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                {/* Welcome message */}
                {state.conversation.length === 0 && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-[85%] bg-white/50 dark:bg-surface-dark/50 p-5 rounded-2xl rounded-tl-sm backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                                {state.mode === 'startup' ? (
                                    <>Bonjour{state.companyName ? ` ${state.companyName}` : ''} ! 🚀 Je suis votre co-fondateur IA. Pour bien démarrer, <strong>décrivez-moi le concept de votre projet et votre public cible.</strong></>
                                ) : (
                                    <>Bonjour{state.companyName ? ` ${state.companyName}` : ''} ! 👋 Je suis votre auditeur IA. Pour commencer l&apos;analyse, <strong>décrivez-moi brièvement votre activité, votre cible et vos objectifs actuels.</strong></>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {state.conversation.map((msg, i) => (
                        <motion.div
                            key={`${msg.role}-${i}-${msg.timestamp || i}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                ? 'bg-black text-white dark:bg-white dark:text-black rounded-br-sm'
                                : 'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-gray-700'
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {state.isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="bg-gray-50 dark:bg-surface-dark/50 p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 border border-dashed border-gray-200 dark:border-gray-800">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
                                L&apos;IA analyse les données...
                            </span>
                        </div>
                    </div>
                )}

                {state.error && (
                    <div className="flex justify-center my-4 animate-in zoom-in-95 duration-300">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl max-w-md w-full text-center space-y-2">
                            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Une erreur est survenue</p>
                            <p className="text-red-500 dark:text-red-500 text-xs">{state.error}</p>
                            <button
                                onClick={() => state.conversation.length > 0 && sendMessage(state.conversation[state.conversation.length - 1].content)}
                                className="text-[10px] underline text-red-400 hover:text-red-600 font-medium uppercase tracking-tighter"
                            >
                                Réessayer l&apos;envoi
                            </button>
                        </div>
                    </div>
                )}

                {voiceError && (
                    <div className="flex justify-center my-2">
                        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                            {voiceError}
                        </p>
                    </div>
                )}

                <div ref={endRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 sticky bottom-0 z-20">
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                />
                {imageDataUrl && (
                    <div className="mb-2 mx-auto max-w-3xl flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                        <span className="truncate pr-3">Capture: {imageName || 'image'}</span>
                        <button
                            type="button"
                            onClick={() => {
                                setImageDataUrl(null);
                                setImageName(null);
                            }}
                            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                            title="Retirer la capture"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-3 max-w-3xl mx-auto relative">
                    <button
                        onClick={handleVoiceToggle}
                        disabled={isTranscribing}
                        className={`p-4 rounded-full transition-all duration-300 ${isRecording
                            ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110'
                            : 'bg-gray-100 dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        title={isRecording ? "Arrêter l'enregistrement" : "Enregistrement vocal"}
                    >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-4 rounded-full bg-gray-100 dark:bg-surface-dark text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Ajouter une capture d'écran"
                    >
                        <ImagePlus className="w-5 h-5" />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={isRecording ? "Ecoute en cours..." : isTranscribing ? "Transcription en cours..." : "Ecrivez votre message..."}
                            disabled={state.isLoading}
                            rows={1}
                            className="w-full px-5 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-surface-dark focus:border-black dark:focus:border-white focus:outline-none transition-colors disabled:opacity-50 resize-none min-h-[56px] max-h-32"
                            style={{ scrollbarWidth: 'none' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !imageDataUrl) || state.isLoading}
                            title="Envoyer le message"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-0 disabled:pointer-events-none scale-90 hover:scale-100"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {isRecording ? 'Enregistrement vocal actif' : isTranscribing ? 'Transcription en cours' : 'Pressez Entree pour envoyer'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export function GameProgressBar() {
    const { state } = useGame();
    const progress = getPhaseProgress(state.phase, state.conversation?.length || 0);
    const label = getPhaseLabel(state.phase, state.language);

    const stepInfo = {
        'mode_select': { step: 1, total: 5 },
        'company_info': { step: 2, total: 5 },
        'niche_select': { step: 3, total: 5 },
        'conversation': { step: 4, total: 5 },
        'generating_report': { step: 5, total: 5 },
        'report_ready': { step: 5, total: 5 },
        'idle': { step: 0, total: 5 }
    };

    const currentStep = stepInfo[state.phase] || { step: 0, total: 5 };

    return (
        <div className="w-full px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end text-xs font-bold text-gray-500 mb-2">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-black">Étape {currentStep.step} sur {currentStep.total}</span>
                        <span className="text-sm dark:text-gray-300">{label}</span>
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
                    <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
