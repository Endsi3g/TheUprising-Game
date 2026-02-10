import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Wait, I need textarea 
import { SendHorizontal, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

// Oops, need to create textarea component too. 
// For now I'll use a standard textarea with Tailwind classes or create it inline.
// Actually, standard shadcn textarea is just Input with 'textarea' tag basically.

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    onStop: () => void;
    placeholder?: string;
}

export function ChatInput({ input, setInput, onSubmit, isLoading, onStop, placeholder }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "inherit";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <form onSubmit={onSubmit} className="relative flex w-full max-w-3xl mx-auto items-end gap-2 p-4 bg-background">
            <div className="relative flex-1 rounded-xl border bg-muted/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || "Ask anything..."}
                    className="flex min-h-[50px] max-h-[200px] w-full resize-none bg-transparent px-4 py-3.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 scrollbar-hide"
                    rows={1}
                />
                <div className="absolute right-2 bottom-2">
                    {isLoading ? (
                        <Button type="button" size="icon" variant="ghost" onClick={onStop} className="h-8 w-8 rounded-full">
                            <Square className="h-4 w-4 fill-current" />
                            <span className="sr-only">Stop</span>
                        </Button>
                    ) : (
                        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-8 w-8 rounded-lg">
                            <SendHorizontal className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
