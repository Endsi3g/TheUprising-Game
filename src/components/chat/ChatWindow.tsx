"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ConversationMessage } from "@/types/database";

// Initial greeting
const INITIAL_MESSAGES: ConversationMessage[] = [
    { role: "assistant", content: "Bonjour ! Je suis votre assistant expert. Nous avons analysé votre projet. Parlons de la stratégie.", timestamp: new Date().toISOString() },
];

export function ChatWindow() {
    const [messages, setMessages] = useState<ConversationMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            // Find the scrollable viewport inside Radix ScrollArea
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    const playTTS = async (text: string) => {
        try {
            setIsSpeaking(true);
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, language: 'fr' })
            });

            if (!res.ok) throw new Error('TTS failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setIsSpeaking(false);

            await audio.play();
        } catch (err) {
            console.error('Audio playback failed:', err);
            setIsSpeaking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input;
        const userMsg: ConversationMessage = { role: "user", content: userText, timestamp: new Date().toISOString() };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Stop any current audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: messages,
                    mode: 'audit',
                    niche: 'General',
                    language: 'fr'
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const agentText = data.text || "Désolé, une erreur est survenue.";
            const agentMsg: ConversationMessage = {
                role: "assistant",
                content: agentText,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, agentMsg]);

            // Auto-play TTS for the response
            playTTS(agentText);

        } catch (error: any) {
            console.error('Chat error:', error);

            let errorMessage = "Désolé, je rencontre des difficultés techniques pour vous répondre.";

            if (error.name === 'AbortError') {
                errorMessage = "Le délai d'attente est dépassé. Veuillez réessayer ou reformuler votre question.";
            }

            setMessages(prev => [...prev, {
                role: "assistant",
                content: errorMessage,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
            clearTimeout(timeoutId);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-background">
            <header className="flex h-14 items-center justify-between border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="font-semibold text-lg flex items-center gap-2">
                    <span className="text-xl">✨</span> Salon IA
                    {isSpeaking && <span className="text-xs text-green-500 animate-pulse ml-2">● En train de parler</span>}
                </div>
            </header>

            <ScrollArea className="flex-1 p-0" ref={scrollRef}>
                <div className="flex flex-col max-w-3xl mx-auto min-h-full pb-8">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 min-h-[400px]">
                            <div className="text-4xl mb-4">👋</div>
                            <p className="text-lg font-medium text-foreground">Bienvenue !</p>
                            <p>Commencez la conversation ou choisissez un mode.</p>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <MessageBubble key={i} role={m.role} content={m.content} />
                        ))
                    )}
                    {isLoading && <MessageBubble role="assistant" content="" isThinking />}
                </div>
            </ScrollArea>

            <div className="border-t bg-background p-0">
                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onStop={() => setIsLoading(false)}
                />
                <div className="text-center pb-4 text-xs text-muted-foreground">
                    L'IA peut faire des erreurs. Vérifiez les informations importantes.
                </div>
            </div>

            {/* Hidden audio element for browser permission management hints if needed */}
        </div>
    );
}
