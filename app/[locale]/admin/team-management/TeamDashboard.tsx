import React from 'react';
import MemberList from './MemberList';
import ColorManager from './ColorManager';
import CalendarOverview from './CalendarOverview';

export default function TeamDashboard() {
  return (
    <div className="glass-elevated rounded-3xl p-8 shadow-xl space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 gradient-text-amber">Gestion d’équipe</h2>
      <MemberList />
      <ColorManager />
      <CalendarOverview />
    </div>
  );
}
