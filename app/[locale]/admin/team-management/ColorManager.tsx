import React from 'react';

export default function ColorManager() {
  // TODO: palette, assignation, gestion couleur par membre/événement
  return (
    <section className="card p-6 mb-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">Gestion des couleurs</h3>
      <div className="flex gap-4">
        {/* Placeholder for color palette */}
        <div className="w-10 h-10 rounded-full bg-blue-500 shadow-lg" />
        <div className="w-10 h-10 rounded-full bg-emerald-500 shadow-lg" />
        <div className="w-10 h-10 rounded-full bg-amber-500 shadow-lg" />
        <div className="w-10 h-10 rounded-full bg-rose-500 shadow-lg" />
      </div>
      <button className="btn btn-secondary mt-6">Personnaliser</button>
    </section>
  );
}
