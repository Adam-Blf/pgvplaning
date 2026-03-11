'use client';

import { useState, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { LogIn, ArrowLeft, Loader2, Check, ArrowRight, LogOut, Hash } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { authFetch } from '@/lib/auth-fetch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeamJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLogout = async () => {
    if (!auth) {
      router.push('/login');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    router.push('/login');
  };

  const handleInputChange = (index: number, value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized.length <= 1) {
      const newCode = [...code];
      newCode[index] = sanitized;
      setCode(newCode);

      if (sanitized && index < 7) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (pasted.length === 8) {
      setCode(pasted.split(''));
      inputRefs.current[7]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = code.join('');
    if (fullCode.length !== 8) {
      toast.error('Veuillez entrer un code complet (8 caractères)');
      return;
    }

    setLoading(true);

    try {
      const response = await authFetch('/api/teams/join', {
        method: 'POST',
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code invalide');
      }

      setTeamName(data.team.name);
      setSuccess(true);
      toast.success('Vous avez rejoint l\'équipe !');

      setTimeout(() => {
        router.push('/');
      }, 2500);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
        <div
          className="z-10 w-full max-w-md animate-scale-in"
        >
          <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl p-8 text-center ring-1 ring-emerald-500/20">
            <div
              className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 animate-scale-in"
              style={{ animationDelay: '200ms' }}
            >
              <Check className="w-10 h-10 text-emerald-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenue !
            </h1>
            <p className="text-[var(--text-tertiary)] text-lg">
              Vous avez rejoint l&apos;équipe <strong className="text-[var(--blueprint-500)] underline">{teamName}</strong>
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-mono text-[var(--text-muted)] tracking-widest uppercase">Redirection en cours...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-[var(--blueprint-500)] opacity-5 blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[var(--cyan-500)] opacity-5 blur-[100px]" />

      {/* Logout button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-full"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
      </Button>

      <div
        className="w-full max-w-md relative z-10 animate-fade-up opacity-0"
      >
        <Card className="glass-elevated border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-default)] bg-[var(--bg-overlay)]/50 flex items-center justify-between">
            <Link
              href="/team/onboarding"
              className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--blueprint-500)] transition-colors font-mono tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" />
              RETOUR
            </Link>
            <span className="text-[10px] font-mono text-[var(--blueprint-500)]/70 tracking-widest uppercase">Mode Adhésion</span>
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--blueprint-500)]/10 flex items-center justify-center border border-[var(--blueprint-500)]/20 shadow-lg shadow-blue-500/10">
                <Hash className="w-8 h-8 text-[var(--blueprint-500)]" />
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold gradient-text-amber">
                  Code d&apos;invitation
                </CardTitle>
                <CardDescription className="mt-1">
                  Saisissez les 8 caractères pour rejoindre
                </CardDescription>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              <div onPaste={handlePaste} className="flex justify-center gap-2">
                {code.map((char, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    value={char}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-14 md:w-11 md:h-16 text-center text-2xl font-mono font-bold rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-overlay)] text-[var(--blueprint-500)] focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all animate-scale-in opacity-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading || code.join('').length !== 8}
                  className="w-full h-14 rounded-2xl bg-[var(--blueprint-500)] text-white font-bold text-base hover:bg-[var(--blueprint-600)] shadow-lg shadow-blue-500/20 disabled:opacity-30 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Rejoindre l&apos;équipe
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="p-4 rounded-2xl bg-[var(--bg-overlay)] border border-[var(--border-default)]">
                  <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed uppercase tracking-wider font-semibold">
                    Un code est nécessaire pour accéder au planning partagé.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
