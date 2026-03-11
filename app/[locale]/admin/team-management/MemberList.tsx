import React from 'react';

export default function MemberList() {
  // TODO: fetch team members, roles, drag & drop, add/remove
  return (
    <section className="card p-6 mb-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">Membres de l’équipe</h3>
      <div className="flex flex-wrap gap-4">
        {/* Placeholder for members */}
        <div className="skeleton w-32 h-16 rounded-xl" />
        <div className="skeleton w-32 h-16 rounded-xl" />
        <div className="skeleton w-32 h-16 rounded-xl" />
      </div>
      <button className="btn btn-primary mt-6">Ajouter un membre</button>
    </section>
  );
}
