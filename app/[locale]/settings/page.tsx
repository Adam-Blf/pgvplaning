'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Check,
  Mail,
  User,
  Settings,
  Bell,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
  Building2,
  Briefcase,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    employeeType: profile?.employeeType || 'cdi',
    workTimeCategory: profile?.workTimeCategory || 'temps-plein',
    workTimePercentage: profile?.workTimePercentage || 100,
    sector: profile?.sector || 'prive',
    color: profile?.color || '#3B82F6',
    icalToken: profile?.icalToken || '',
  });

  useEffect(() => {
    if (profile && user) {
      setFormData({
        displayName: profile.displayName || '',
        email: user.email || '',
        employeeType: profile.employeeType || 'cdi',
        workTimeCategory: profile.workTimeCategory || 'temps-plein',
        workTimePercentage: profile.workTimePercentage || 100,
        sector: profile.sector || 'prive',
        color: profile.color || '#3B82F6',
        icalToken: profile.icalToken || '',
      });
    }
  }, [profile, user]);

  const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (!db) throw new Error('Firestore not initialized');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        employeeType: formData.employeeType,
        workTimeCategory: formData.workTimeCategory,
        workTimePercentage: formData.workTimePercentage,
        sector: formData.sector,
        color: formData.color,
        icalToken: formData.icalToken || generateToken(),
        updatedAt: new Date(),
      });

      toast.success('Profil mis à jour avec succès', {
        icon: <Check className="w-4 h-4 text-emerald-500" />
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--blueprint-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--blueprint-500)]/10 flex items-center justify-center border border-[var(--blueprint-500)]/20">
          <Settings className="w-7 h-7 text-[var(--blueprint-500)]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Paramètres</h1>
          <p className="text-[var(--text-tertiary)]">Gérez votre profil et vos préférences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-elevated border-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--blueprint-500)]" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>Mettez à jour vos informations de base</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nom complet</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="bg-white/5 border-white/10"
                    placeholder="Ex: Adam Beloucif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Lecture seule)</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Type de contrat</Label>
                  <Select
                    value={formData.employeeType}
                    onValueChange={(v: any) => setFormData({ ...formData, employeeType: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border-white/10">
                      <SelectItem value="cdi">CDI</SelectItem>
                      <SelectItem value="cdd">CDD</SelectItem>
                      <SelectItem value="apprentissage">Apprenti</SelectItem>
                      <SelectItem value="professionnalisation">Contrat Pro</SelectItem>
                      <SelectItem value="stage">Stagiaire</SelectItem>
                      <SelectItem value="interim">Intérimaire</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="mandataire">Mandataire Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Secteur</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(v: any) => setFormData({ ...formData, sector: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Choisir un secteur" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border-white/10">
                      <SelectItem value="prive">Secteur Privé</SelectItem>
                      <SelectItem value="public">Secteur Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <Label>Catégorie de temps de travail</Label>
                  <Select
                    value={formData.workTimeCategory}
                    onValueChange={(v: any) => setFormData({ ...formData, workTimeCategory: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border-white/10">
                      <SelectItem value="temps-plein">Temps Plein (35h)</SelectItem>
                      <SelectItem value="temps-partiel">Temps Partiel</SelectItem>
                      <SelectItem value="forfait-jours">Forfait Jours</SelectItem>
                      <SelectItem value="forfait-heures">Forfait Heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.workTimeCategory === 'temps-partiel' && (
                  <div className="space-y-2">
                    <Label>Pourcentage du temps de travail (%)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="100"
                      value={formData.workTimePercentage}
                      onChange={(e) => setFormData({ ...formData, workTimePercentage: parseInt(e.target.value) || 100 })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Couleur sur le Calendrier d&apos;Équipe
                </Label>
                <div className="flex flex-wrap gap-3">
                  {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={cn(
                        "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                        formData.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 p-1 bg-white/5 border-white/10 rounded-xl cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[var(--text-tertiary)] uppercase">{formData.color}</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] italic">
                  Cette couleur sera utilisée pour vous identifier sur le planning d&apos;équipe et les exports PDF.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-elevated border-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5 text-[var(--cyan-400)]" />
                Préférences de Notification
              </CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être informé</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-[var(--blueprint-500)]/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications Email</Label>
                  <p className="text-sm text-[var(--text-tertiary)]">Recevoir un récapitulatif hebdomadaire</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-[var(--blueprint-500)]/30 transition-all">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertes d&apos;Équipe</Label>
                  <p className="text-sm text-[var(--text-tertiary)]">Être notifié quand un membre pose un congé</p>
                </div>
                <Switch checked={false} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar / Status */}
        <div className="space-y-6">
          <Card className="glass-elevated border-white/10 rounded-3xl overflow-hidden self-start">
            <CardHeader className="bg-gradient-to-br from-[var(--blueprint-500)]/10 to-transparent p-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--blueprint-500)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <Save className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sauvegarder"}
              </Button>
              <p className="text-[10px] text-center text-[var(--text-muted)] uppercase tracking-widest font-bold">
                Dernière mise à jour : {profile?.updatedAt ? new Date(profile.updatedAt.seconds * 1000).toLocaleDateString() : 'Jamais'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-elevated border-rose-500/20 rounded-3xl overflow-hidden bg-rose-500/5">
            <CardHeader className="p-6">
              <CardTitle className="text-rose-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Zone de Danger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                La suppression du compte est irréversible et effacera toutes vos données.
              </p>
              <Button variant="outline" className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl">
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
