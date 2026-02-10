import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from 'next/link';

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    href,
    isSpecial,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    href?: string;
    isSpecial?: boolean;
}) => {
    const content = (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento transition duration-200 p-4 border justify-between flex flex-col space-y-4 h-full",
                // Standard Card Styles
                !isSpecial && "bg-white dark:bg-black border-transparent shadow-input dark:shadow-none hover:shadow-xl dark:border-white/[0.2]",
                // Special "Catalogue" Card Styles
                isSpecial && "bg-transparent border-dashed border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 items-center justify-center cursor-pointer shadow-none",
                className
            )}
        >
            {isSpecial ? (
                <>
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 transition-transform group-hover/bento:scale-110">
                        <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="font-sans font-medium text-gray-600 dark:text-gray-300 text-center">
                        {title}
                    </div>
                </>
            ) : (
                <>
                    {header}
                    <div className="group-hover/bento:translate-x-2 transition duration-200">
                        {icon}
                        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                            {title}
                        </div>
                        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                            {description}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className={cn("block h-full w-full", className && className.includes("col-span") ? className : "")}>
                {content}
            </Link>
        );
    }

    return content;
};
