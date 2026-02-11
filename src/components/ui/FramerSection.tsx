'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FramerSectionProps {
    url?: string | null;
    title: string;
    className?: string;
    minHeightClassName?: string;
    children: ReactNode;
}

/**
 * Render a Framer-published section when URL is configured.
 * Fallbacks to native React content when URL is missing.
 */
export function FramerSection({
    url,
    title,
    className,
    minHeightClassName = 'min-h-[420px]',
    children,
}: FramerSectionProps) {
    if (url) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                    'overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-soft',
                    minHeightClassName,
                    className
                )}
            >
                <iframe
                    src={url}
                    title={title}
                    className="h-full min-h-[420px] w-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </motion.section>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.section>
    );
}
