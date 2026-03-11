'use client';

import { useState } from 'react';
import {
  Mail,
  MessageSquare,
  User,
  Send,
  Loader2,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation de l'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Message envoyé avec succès !', {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    });

    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div
      className="max-w-6xl mx-auto space-y-12 pb-20 stagger-children"
    >
      {/* Header Section */}
      <div className="text-center space-y-4 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--blueprint-500)]/10 border border-[var(--blueprint-500)]/20 text-[var(--blueprint-400)] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Support & Contact
        </div>
        <h1 className="text-5xl font-black tracking-tighter sm:text-6xl">
          <span className="gradient-text-amber">Une question ?</span> <span className="text-[var(--blueprint-500)]">Écrivez-nous.</span>
        </h1>
        <p className="text-[var(--text-tertiary)] text-lg max-w-2xl mx-auto">
          Notre équipe est là pour vous aider à optimiser la gestion de votre planning.
          Réponse garantie sous 24h.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 animate-fade-up opacity-0" style={{ animationDelay: '80ms' }}>
          <Card className="glass-elevated border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden group hover:border-[var(--blueprint-500)]/30 transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Siège Social</h4>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Blackout Prod - Lab Innovation<br />
                  Solutions Planning Cloud<br />
                  France
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-elevated border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden group hover:border-[var(--blueprint-500)]/30 transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Email Direct</h4>
                <p className="text-sm text-[var(--text-tertiary)]">Général & Partenariats</p>
                <a href="mailto:contact@blackoutprod.fr" className="text-[var(--blueprint-500)] hover:text-[var(--cyan-400)] text-sm font-medium hover:underline">
                  contact@blackoutprod.fr
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-elevated border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden group hover:border-[var(--blueprint-500)]/30 transition-all">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-[var(--blueprint-500)] shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Disponibilité</h4>
                <p className="text-sm text-[var(--text-tertiary)]">Support Administratif</p>
                <p className="text-sm text-white font-medium">Lundi - Vendredi | 9h-18h</p>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--blueprint-500)]/20 to-transparent border border-[var(--blueprint-500)]/20">
            <div className="flex items-center gap-3 mb-4 text-white">
              <Globe className="w-5 h-5 text-[var(--blueprint-400)]" />
              <span className="font-bold">Présence Mondiale</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Absencia est utilisé par plus de 500 équipes à travers l&apos;Europe pour la gestion de leurs plannings professionnels et associatifs.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 animate-fade-up opacity-0" style={{ animationDelay: '160ms' }}>
          <Card className="glass-elevated border-white/10 bg-white/[0.03] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -mr-32 -mt-32" />

            <CardHeader className="p-8 pb-4 relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--blueprint-500)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">Envoyez-nous un message</CardTitle>
              </div>
              <CardDescription>
                Remplissez ce formulaire et nous reviendrons vers vous très rapidement.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 relative">
                {isSubmitted ? (
                  <div
                    className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-scale-in"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">C&apos;est en route !</h3>
                      <p className="text-[var(--text-tertiary)] max-w-sm">
                        Merci pour votre message. Notre équipe de support Absencia traite votre demande.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      className="rounded-xl border-white/10 hover:bg-white/5"
                    >
                      Envoyer un nouveau message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-[var(--text-secondary)]">Nom Complet</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Jean Dupont"
                            className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-[var(--blueprint-500)]/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-[var(--text-secondary)]">Adresse Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="jean@monentreprise.fr"
                            className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-[var(--blueprint-500)]/50 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[var(--text-secondary)]">Objet de la demande</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(v) => setFormData({ ...formData, subject: v })}
                        required
                      >
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                          <SelectValue placeholder="Sélectionnez un sujet" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="support">Support Technique</SelectItem>
                          <SelectItem value="billing">Facturation & Abonnements</SelectItem>
                          <SelectItem value="feature">Suggestion de fonctionnalité</SelectItem>
                          <SelectItem value="partnership">Partenariats</SelectItem>
                          <SelectItem value="other">Autre demande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-[var(--text-secondary)]">Votre Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="min-h-[160px] bg-white/5 border-white/10 rounded-2xl p-4 focus:border-[var(--blueprint-500)]/50 transition-all resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-[var(--blueprint-500)] hover:bg-[var(--blueprint-600)] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-lg transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le message
                          <Send className="w-5 h-5 ml-3" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
