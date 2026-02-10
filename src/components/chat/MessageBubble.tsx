import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
    role: "user" | "assistant";
    content: string;
    isThinking?: boolean;
}

export function MessageBubble({ role, content, isThinking }: MessageBubbleProps) {
    const isUser = role === "user";

    if (isThinking) {
        return (
            <div className="flex w-full gap-4 p-4 text-muted-foreground animate-pulse">
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-48 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex w-full gap-4 p-6", isUser ? "bg-muted/30" : "bg-background")}>
            <Avatar className="h-8 w-8 border mt-1 shrink-0">
                {isUser ? (
                    <>
                        <AvatarImage src="/user-avatar.png" />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </>
                ) : (
                    <>
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </>
                )}
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>
            </div>
        </div>
    );
}
