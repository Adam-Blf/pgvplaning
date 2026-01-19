'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, Loader2, Check, ArrowRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function TeamJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
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
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        router.push('/calendar');
      }, 2000);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        <div
          className="fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm p-8 text-center max-w-md relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/20"
          >
            <Check className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
            Bienvenue !
          </h1>
          <p className="text-zinc-400">
            Vous avez rejoint l&apos;équipe <strong className="text-zinc-200">{teamName}</strong>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 text-zinc-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono">REDIRECTION EN COURS...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-all z-50"
        title="Déconnexion"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
          {/* Header band */}
          <div className="px-6 py-4 bg-emerald-500/5 border-b border-emerald-500/10">
            <div className="flex items-center justify-between">
              <Link
                href="/team/setup"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                RETOUR
              </Link>
              <span className="text-xs font-mono text-emerald-500/50">REJOINDRE</span>
            </div>
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
                <LogIn className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-100">
                  Rejoindre une équipe
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Entrez le code fourni par votre équipe
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-4 text-center">
                  CODE D&apos;INVITATION (8 CARACTÈRES)
                </label>

                <div
                  className="flex justify-center gap-2"
                  onPaste={handlePaste}
                >
                  {code.map((char, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      value={char}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-11 h-14 text-center text-xl font-mono font-bold rounded-xl border-2 border-zinc-700/50 bg-zinc-800/50 text-emerald-500 focus:border-emerald-500/50 focus:outline-none focus:bg-emerald-500/5 transition-all"
                      maxLength={1}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <p className="text-xs text-zinc-600 text-center mt-4 font-mono">
                  CTRL+V POUR COLLER LE CODE
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.join('').length !== 8}
                className="w-full px-4 py-4 rounded-xl bg-emerald-500 text-zinc-900 font-semibold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  <>
                    Rejoindre l&apos;équipe
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Help text */}
              <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  <strong className="text-zinc-400 block mb-1">Pas de code ?</strong>
                  Demandez à votre responsable d&apos;équipe de vous fournir le code d&apos;invitation depuis l&apos;espace Administration.
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
