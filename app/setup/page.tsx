'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Check, Database, ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const setupSQL = `-- PGV Planning - Configuration Base de Données

-- Supprime la table si elle existe
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Crée la table profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Politique: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politique: Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, phone)
  VALUES (
    NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automatique à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;`;

export default function SetupPage() {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setChecking(true);
    const supabase = createClient();
    if (!supabase) {
      setTableExists(null);
      setChecking(false);
      return;
    }

    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      setTableExists(!error);
    } catch {
      setTableExists(false);
    }
    setChecking(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1] || 'votre-projet';

  return (
    <div className="fixed inset-0 bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuration Base de Données</h1>
            <p className="text-slate-400">Initialisation automatique des tables Supabase</p>
          </div>
        </div>

        {/* Status Check */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">État de la Base de Données</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Supabase configuré</span>
              {isSupabaseConfigured() ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Table profiles</span>
              {checking ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : tableExists ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
          </div>

          {tableExists && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 font-medium">Base de données configurée !</p>
              <p className="text-emerald-400/70 text-sm mt-1">
                Tout est prêt. Vous pouvez retourner à l&apos;application.
              </p>
            </div>
          )}

          {!tableExists && !checking && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 font-medium">Configuration requise</p>
              <p className="text-amber-400/70 text-sm mt-1">
                Suivez les instructions ci-dessous pour créer les tables.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!tableExists && (
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Instructions</h2>

            <ol className="space-y-4 text-slate-300 mb-6">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-sm flex items-center justify-center font-medium">1</span>
                <div>
                  <p>Ouvrez le SQL Editor de votre projet Supabase</p>
                  <a
                    href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm mt-1"
                  >
                    Ouvrir SQL Editor <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-sm flex items-center justify-center font-medium">2</span>
                <p>Copiez le script SQL ci-dessous</p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-sm flex items-center justify-center font-medium">3</span>
                <p>Collez-le dans l&apos;éditeur et cliquez sur &quot;Run&quot;</p>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-sm flex items-center justify-center font-medium">4</span>
                <div>
                  <p>Revenez ici et rafraîchissez pour vérifier</p>
                  <button
                    onClick={checkDatabase}
                    className="text-violet-400 hover:text-violet-300 text-sm mt-1"
                  >
                    Vérifier maintenant
                  </button>
                </div>
              </li>
            </ol>

            {/* SQL Code */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-400">Script SQL</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <pre className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto text-xs text-slate-300 max-h-96 overflow-y-auto">
                <code>{setupSQL}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Retour à l&apos;application
          </Link>
        </div>
      </div>
    </div>
  );
}
