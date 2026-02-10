import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, BrainCircuit, ArrowRight, MousePointerClick, Moon, Sun } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700 transition-colors duration-300">

      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-sm font-medium tracking-wide">KIOSK v2.0</span>
        </div>
        {/* Theme toggle would go here if implemented as a component, for now dynamic class toggling is assumed handled by a provider or user preference */}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-4 sm:px-8">

        {/* Ambient Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-4xl w-full flex flex-col items-center space-y-12 z-10">

          {/* Text Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              Bonjour ! <br />
              Prêt pour votre audit ?
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-lg mx-auto">
              Sélectionnez une option ci-dessous pour commencer votre expérience interactive.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">

            {/* Portfolio Card */}
            <Link href="/portfolio" className="group flex flex-col items-start p-8 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-soft hover:shadow-hover text-left focus:outline-none transition-all duration-200 hover:-translate-y-0.5">
              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-lg mb-4 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:underline decoration-1 underline-offset-4">Découvrir nos projets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Explorez notre portfolio et nos études de cas récentes.
              </p>
              <div className="mt-6 flex items-center text-sm font-medium text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                Explorer <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </Link>

            {/* Audit Card */}
            <Link href="/audit" className="group flex flex-col items-start p-8 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-soft hover:shadow-hover text-left focus:outline-none transition-all duration-200 hover:-translate-y-0.5">
              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-lg mb-4 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:underline decoration-1 underline-offset-4">Lancer l'Audit IA</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Analysez vos besoins avec notre assistant intelligent.
              </p>
              <div className="mt-6 flex items-center text-sm font-medium text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                Commencer <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </Link>

            {/* Start Business Card */}
            <Link href="/start" className="group flex flex-col items-start p-8 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-soft hover:shadow-hover text-left focus:outline-none transition-all duration-200 hover:-translate-y-0.5 md:col-span-2">
              <div className="p-3 bg-gray-50 dark:bg-surface-dark rounded-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <MousePointerClick className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:underline decoration-1 underline-offset-4">Démarrer son Entreprise</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Un guide pas à pas pour transformer votre idée en réalité.
              </p>
              <div className="mt-6 flex items-center text-sm font-medium text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                C'est parti <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-6 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Système opérationnel</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-3 h-3" />
            <span>Toucher l'écran pour commencer</span>
          </div>
          <Link href="/admin" className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors p-1 group">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Administration</span>
            <span className="text-lg leading-none">π</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
