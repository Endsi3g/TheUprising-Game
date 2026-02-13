import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Project {
    id: number;
    slug: string;
    title: string;
    description: string;
    category: string;
    icon: LucideIcon;
    image: string;
    color: string;
}

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link
            href={`/portfolio/${project.slug}`}
            className="relative block flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[800px] bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-card-hover transition-all duration-500 group cursor-pointer h-full"
        >
            {/* Image container */}
            <div className="w-full aspect-[21/9] md:aspect-[16/8] relative overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 z-10", project.color)} />
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6 z-20">
                    <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-black/90 text-black dark:text-white rounded-xl backdrop-blur-md shadow-lg border border-white/20">
                        {project.category}
                    </span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                        <ArrowUpRight className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-10 md:p-14 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{project.title}</h3>
                    <project.icon className="w-8 h-8 text-gray-200 dark:text-gray-800" />
                </div>
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-2xl">
                    {project.description}
                </p>
                <div className="pt-4 flex items-center gap-4 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group/link">
                    Voir le Case Study
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                </div>
            </div>
        </Link>
    );
}
