'use client';

import { Link } from '@/i18n/routing';

import { Home, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 max-w-md w-full text-center">
        <div className="space-y-6 animate-fade-up opacity-0">
          {/* Fantôme animé */}
          <div className="inline-block animate-bounce">
            <Ghost className="w-24 h-24 text-violet-400 mx-auto" />
          </div>

          {/* Code d'erreur */}
          <div className="animate-scale-in" style={{ animationDelay: '80ms' }}>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              Page introuvable
            </h2>
            <p className="text-slate-400">
              Oups ! Cette page semble s&apos;être perdue dans le calendrier...
            </p>
          </div>

          {/* Bouton retour */}
          <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
