import React from 'react';

export default function CalendarOverview() {
  // TODO: vue globale, filtres, export webcal, gestion chef
  return (
    <section className="card p-6 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">Vue globale des calendriers</h3>
      <div className="flex flex-wrap gap-4">
        {/* Placeholder for calendar overview */}
        <div className="skeleton w-40 h-24 rounded-xl" />
        <div className="skeleton w-40 h-24 rounded-xl" />
      </div>
      <button className="btn btn-outline mt-6">Exporter en Webcal</button>
    </section>
  );
}
