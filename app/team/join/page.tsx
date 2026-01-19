'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TeamJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized.length <= 1) {
      const newCode = [...code];
      newCode[index] = sanitized;
      setCode(newCode);

      // Move to next input if value entered
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
        throw new Error(data.error || 'Erreur lors de la jonction');
      }

      setTeamName(data.team.name);
      setSuccess(true);
      toast.success('Vous avez rejoint l\'équipe !');

      // Redirect after short delay
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Bienvenue !
          </h1>
          <p className="text-[var(--text-muted)]">
            Vous avez rejoint l&apos;équipe <strong>{teamName}</strong>
          </p>

          <p className="text-sm text-[var(--text-muted)] mt-6">
            Redirection vers le calendrier...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Back link */}
          <Link
            href="/team/setup"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Rejoindre une équipe
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Entrez le code fourni par votre chef d&apos;équipe
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4 text-center">
                Code équipe (8 caractères)
              </label>

              <div
                className="flex justify-center gap-2"
                onPaste={handlePaste}
              >
                {code.map((char, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    value={char}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-mono font-bold rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>

              <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                Vous pouvez coller le code directement
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 8}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Rejoindre l\'équipe'
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-6 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)]">
              <strong className="text-[var(--text-secondary)]">Pas de code ?</strong><br />
              Demandez à votre chef d&apos;équipe de vous fournir le code d&apos;invitation.
              Il peut le trouver dans les paramètres de l&apos;équipe.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
