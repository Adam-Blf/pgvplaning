'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Download, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GlassCard } from '@/components/ui/glass-card';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useHistory, HistoryItem } from '@/hooks/use-history';

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

function HistoryCard({ item, onRegenerate, onDelete }: {
  item: HistoryItem;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const createdAt = new Date(item.createdAt);
  const formattedDate = format(createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr });

  const totalDays = item.periods.reduce((acc, period) => {
    const start = new Date(period.startDate.split('/').reverse().join('-'));
    const end = new Date(period.endDate.split('/').reverse().join('-'));
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return acc + diff;
  }, 0);

  return (
    <motion.div variants={itemVariants} layout>
      <GlassCard className="p-4" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="font-semibold truncate">{item.employeeName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>
                {item.periods.length} période{item.periods.length > 1 ? 's' : ''} • {totalDays} jour{totalDays > 1 ? 's' : ''}
              </span>
            </div>

            {/* Détail des périodes */}
            <div className="mt-3 space-y-1">
              {item.periods.slice(0, 2).map((period, index) => (
                <div key={index} className="text-xs text-gray-400">
                  {period.title}: {period.startDate} → {period.endDate}
                </div>
              ))}
              {item.periods.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{item.periods.length - 2} autre{item.periods.length - 2 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onRegenerate}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              title="Télécharger à nouveau"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function HistoryList() {
  const { history, isLoading, removeFromHistory, clearHistory, regenerateIcs } = useHistory();

  const handleRegenerate = async (item: HistoryItem) => {
    try {
      await regenerateIcs(item);
      toast.success('Fichier ICS téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = (id: string) => {
    removeFromHistory(id);
    toast.success('Élément supprimé de l\'historique');
  };

  const handleClearAll = () => {
    if (window.confirm('Voulez-vous vraiment supprimer tout l\'historique ?')) {
      clearHistory();
      toast.success('Historique vidé');
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="w-full max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">Chargement de l&apos;historique...</div>
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <GlassCard className="w-full max-w-2xl mx-auto p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
        <p className="text-gray-500">
          Vos fichiers ICS générés apparaîtront ici
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Historique</h2>
        <MagneticButton
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Tout effacer
        </MagneticButton>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence>
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onRegenerate={() => handleRegenerate(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default HistoryList;
