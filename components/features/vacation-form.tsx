'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, FileText, Plus, Trash2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedInput } from '@/components/ui/animated-input';
import { VacationPeriod } from '@/lib/schemas/planning';

interface FormPeriod {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export function VacationForm() {
  const [employeeName, setEmployeeName] = useState('');
  const [periods, setPeriods] = useState<FormPeriod[]>([
    {
      id: crypto.randomUUID(),
      startDate: '',
      endDate: '',
      title: 'Vacances',
      description: '',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPeriod = () => {
    if (periods.length >= 10) {
      toast.error('Maximum 10 périodes de vacances');
      return;
    }
    setPeriods([
      ...periods,
      {
        id: crypto.randomUUID(),
        startDate: '',
        endDate: '',
        title: 'Vacances',
        description: '',
      },
    ]);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) {
      toast.error('Au moins une période est requise');
      return;
    }
    setPeriods(periods.filter((p) => p.id !== id));
  };

  const updatePeriod = (id: string, field: keyof FormPeriod, value: string) => {
    setPeriods(
      periods.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    // Effacer l'erreur du champ modifié
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${id}-${field}`];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!employeeName.trim()) {
      newErrors.employeeName = 'Le nom est requis';
    } else if (employeeName.length < 2) {
      newErrors.employeeName = 'Le nom doit contenir au moins 2 caractères';
    }

    periods.forEach((period) => {
      if (!period.startDate) {
        newErrors[`${period.id}-startDate`] = 'Date de début requise';
      }
      if (!period.endDate) {
        newErrors[`${period.id}-endDate`] = 'Date de fin requise';
      }
      if (!period.title.trim()) {
        newErrors[`${period.id}-title`] = 'Titre requis';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setIsLoading(true);

    try {
      const formattedPeriods: VacationPeriod[] = periods.map((p) => ({
        startDate: p.startDate,
        endDate: p.endDate,
        title: p.title,
        description: p.description || undefined,
      }));

      const response = await fetch('/api/generate-ics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          periods: formattedPeriods,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      // Télécharger le fichier ICS
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vacances-${employeeName.toLowerCase().replace(/\s+/g, '-')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Sauvegarder dans l'historique
      const historyItem = {
        id: crypto.randomUUID(),
        employeeName,
        periods: formattedPeriods,
        createdAt: new Date().toISOString(),
      };
      const existingHistory = JSON.parse(localStorage.getItem('pgv-history') || '[]');
      localStorage.setItem(
        'pgv-history',
        JSON.stringify([historyItem, ...existingHistory].slice(0, 20))
      );

      toast.success('Fichier ICS généré avec succès !');

      // Dispatch custom event pour rafraîchir l'historique
      window.dispatchEvent(new CustomEvent('pgv-history-updated'));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la génération'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-2xl mx-auto" padding="lg">
      <form onSubmit={handleSubmit}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Titre */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gradient">
              Générateur de Planning
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Créez votre fichier ICS en quelques clics
            </p>
          </motion.div>

          {/* Nom de l'employé */}
          <motion.div variants={itemVariants}>
            <AnimatedInput
              label="Nom de l'employé"
              value={employeeName}
              onChange={(e) => {
                setEmployeeName(e.target.value);
                setErrors((prev) => ({ ...prev, employeeName: '' }));
              }}
              error={errors.employeeName}
              icon={<User className="w-5 h-5" />}
            />
          </motion.div>

          {/* Périodes de vacances */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Périodes de vacances</h3>
              <MagneticButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={addPeriod}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </MagneticButton>
            </div>

            {periods.map((period, index) => (
              <motion.div
                key={period.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Période {index + 1}
                  </span>
                  {periods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePeriod(period.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedInput
                    label="Date de début (JJ/MM/AAAA)"
                    value={period.startDate}
                    onChange={(e) =>
                      updatePeriod(period.id, 'startDate', e.target.value)
                    }
                    error={errors[`${period.id}-startDate`]}
                    icon={<Calendar className="w-5 h-5" />}
                    placeholder="01/01/2026"
                  />
                  <AnimatedInput
                    label="Date de fin (JJ/MM/AAAA)"
                    value={period.endDate}
                    onChange={(e) =>
                      updatePeriod(period.id, 'endDate', e.target.value)
                    }
                    error={errors[`${period.id}-endDate`]}
                    icon={<Calendar className="w-5 h-5" />}
                    placeholder="15/01/2026"
                  />
                </div>

                <AnimatedInput
                  label="Titre"
                  value={period.title}
                  onChange={(e) =>
                    updatePeriod(period.id, 'title', e.target.value)
                  }
                  error={errors[`${period.id}-title`]}
                  icon={<FileText className="w-5 h-5" />}
                />

                <AnimatedInput
                  label="Description (optionnel)"
                  value={period.description}
                  onChange={(e) =>
                    updatePeriod(period.id, 'description', e.target.value)
                  }
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Bouton de soumission */}
          <motion.div variants={itemVariants} className="pt-4">
            <MagneticButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Générer le fichier ICS
                </>
              )}
            </MagneticButton>
          </motion.div>
        </motion.div>
      </form>
    </GlassCard>
  );
}

export default VacationForm;
