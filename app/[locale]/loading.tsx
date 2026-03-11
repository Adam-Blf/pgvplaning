'use client';


import { Calendar } from 'lucide-react';

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-6">
        {/* Logo animé */}
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 animate-pulse"
        >
          <Calendar className="w-10 h-10 text-white" />
        </div>

        {/* Texte de chargement */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Chargement...
          </h2>

          {/* Barre de progression animée */}
          <div className="w-48 h-1 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ width: '50%' }}
            />
          </div>
        </div>

        {/* Points de chargement */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
