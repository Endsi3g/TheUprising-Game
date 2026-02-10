'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AvatarProps {
    state: AvatarState;
    className?: string;
}

export default function Avatar({ state, className = '' }: AvatarProps) {
    // Glow color based on state
    const glowColor = useMemo(() => {
        switch (state) {
            case 'listening': return 'rgba(34, 197, 94, 0.6)'; // Green
            case 'thinking': return 'rgba(168, 85, 247, 0.6)'; // Purple
            case 'speaking': return 'rgba(59, 130, 246, 0.6)'; // Blue
            default: return 'rgba(156, 163, 175, 0.3)'; // Gray
        }
    }, [state]);

    return (
        <div className={`relative w-48 h-48 flex items-center justify-center ${className}`}>
            {/* Background Glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                animate={{
                    backgroundColor: glowColor,
                    scale: state === 'listening' || state === 'speaking' ? [1, 1.2, 1] : 1,
                    opacity: state === 'idle' ? 0.3 : 0.6,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Core Orb */}
            <div className="relative z-10 w-32 h-32 bg-black dark:bg-white rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Visualizer Bars (for Speaking) */}
                {state === 'speaking' && (
                    <div className="flex items-center gap-1.5 h-12">
                        {[1, 2, 3, 4, 3, 2, 1].map((i, index) => (
                            <motion.div
                                key={index}
                                className="w-2 bg-white dark:bg-black rounded-full"
                                animate={{
                                    height: [10, 30 * (i / 2), 10],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: index * 0.1,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Pulse Ring (for Listening) */}
                {state === 'listening' && (
                    <motion.div
                        className="absolute w-full h-full border-4 border-green-500 rounded-full"
                        animate={{
                            scale: [1, 1.1],
                            opacity: [1, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    />
                )}

                {/* Spinner (for Thinking) */}
                {state === 'thinking' && (
                    <motion.div
                        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                )}

                {/* Idle Dot */}
                {state === 'idle' && (
                    <div className="w-4 h-4 bg-gray-500 rounded-full opacity-50" />
                )}
            </div>
        </div>
    );
}
