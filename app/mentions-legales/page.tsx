'use client';

import { Scale, Building2, Server, Shield, Mail } from 'lucide-react';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="card card-glass relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
              <Scale className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mentions Légales</h1>
              <p className="text-[var(--text-muted)]">Informations juridiques et réglementaires</p>
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur */}
      <section className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Éditeur du site</h2>
        </div>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <p><strong className="text-[var(--text-primary)]">Raison sociale :</strong> Blackout Prod</p>
          <p><strong className="text-[var(--text-primary)]">Forme juridique :</strong> Application interne hospitalière</p>
          <p><strong className="text-[var(--text-primary)]">Directeur de la publication :</strong> Adam Beloucif</p>
          <p><strong className="text-[var(--text-primary)]">Email :</strong> contact@blackoutprod.fr</p>
        </div>
      </section>

      {/* Hébergement */}
      <section className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Server className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Hébergement</h2>
        </div>
        <div className="space-y-3 text-[var(--text-secondary)]">
          <p><strong className="text-[var(--text-primary)]">Hébergeur :</strong> Vercel Inc.</p>
          <p><strong className="text-[var(--text-primary)]">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          <p><strong className="text-[var(--text-primary)]">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">https://vercel.com</a></p>
        </div>
      </section>

      {/* Protection des données */}
      <section className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Protection des données personnelles</h2>
        </div>
        <div className="space-y-4 text-[var(--text-secondary)]">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
            vous disposez de droits sur vos données personnelles.
          </p>
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Stockage local uniquement</h3>
            <p className="text-sm">
              Cette application stocke vos données de planning <strong>exclusivement dans votre navigateur</strong> (localStorage).
              Aucune donnée personnelle n&apos;est transmise à des serveurs externes ou collectée par l&apos;éditeur.
            </p>
          </div>
          <h3 className="font-semibold text-[var(--text-primary)]">Vos droits :</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p className="text-sm text-[var(--text-muted)]">
            Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse indiquée ci-dessus ou effacer
            directement vos données via les paramètres de votre navigateur.
          </p>
        </div>
      </section>

      {/* Propriété intellectuelle */}
      <section className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
            <Scale className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Propriété intellectuelle</h2>
        </div>
        <div className="space-y-4 text-[var(--text-secondary)]">
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, logos, icônes, logiciels) est la propriété
            exclusive de Blackout Prod ou de ses partenaires et est protégé par les lois françaises et
            internationales relatives à la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
            des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans
            l&apos;autorisation écrite préalable de Blackout Prod.
          </p>
        </div>
      </section>

      {/* Contact */}
      <div className="notice notice-info">
        <div className="w-10 h-10 rounded-lg bg-[var(--info-bg)] flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-[var(--info)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text-primary)] mb-1">Une question ?</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            Pour toute question concernant ces mentions légales, n&apos;hésitez pas à nous{' '}
            <Link href="/contact" className="text-[var(--accent)] hover:underline">contacter</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
