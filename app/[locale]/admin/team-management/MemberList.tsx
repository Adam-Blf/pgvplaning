import React from 'react';

export default function MemberList() {
  const members = [
    { id: 'user1', name: 'Alice', color: 'bg-blue-500' },
    { id: 'user2', name: 'Bob', color: 'bg-emerald-500' },
    { id: 'user3', name: 'Charlie', color: 'bg-amber-500' },
  ];

  return (
    <section className="card p-6 mb-8 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">Membres de l’équipe</h3>
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <div key={member.id} className={`card p-4 rounded-xl flex flex-col items-center ${member.color}`}>
            <span className="font-bold text-lg mb-2">{member.name}</span>
            <a
              href={`webcal://${typeof window !== 'undefined' ? window.location.host : 'absencia.beloucif.com'}/api/ical/${member.id}`}
              className="btn btn-secondary mt-2"
              target="_blank"
              rel="noopener"
            >
              S’abonner à son calendrier
            </a>
          </div>
        ))}
      </div>
      <button className="btn btn-primary mt-6">Ajouter un membre</button>
    </section>
  );
}
