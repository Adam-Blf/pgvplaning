'use client';


import { Shield, Scale, Gavel, Eye, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LegalPage() {
    return (
        <div
            className="max-w-4xl mx-auto space-y-12 pb-20 px-4 stagger-children"
        >
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-up opacity-0" style={{ animationDelay: '0ms' }}>
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                    <Shield className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                    Mentions <span className="text-emerald-500">Légales.</span>
                </h1>
                <p className="text-[var(--text-tertiary)] max-w-lg mx-auto uppercase tracking-widest text-xs font-bold leading-relaxed">
                    Transparence & Confidentialité - Absencia v10.0.119
                </p>
            </div>

            <div className="grid gap-8">
                <LegalSection
                    icon={Gavel}
                    title="Édition du site"
                    description="En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site Absencia l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi."
                >
                    <ul className="space-y-4 text-sm text-[var(--text-tertiary)]">
                        <li><strong className="text-white">Propriétaire :</strong> Blackout Prod - Adam Beloucif</li>
                        <li><strong className="text-white">Responsable publication :</strong> Adam Beloucif - contact@blackoutprod.fr</li>
                        <li><strong className="text-white">Hébergeur :</strong> Vercel Inc. - 340 S Lemon Ave #1192 Walnut, CA 91789, USA</li>
                        <li><strong className="text-white">Développement :</strong> Adam Beloucif (Ingénieur Logiciel)</li>
                    </ul>
                </LegalSection>

                <LegalSection
                    icon={Lock}
                    title="Propriété intellectuelle"
                    description="Adam Beloucif est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logos, icônes, sons, logiciels."
                >
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                        Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Adam Beloucif. Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                    </p>
                </LegalSection>

                <LegalSection
                    icon={Scale}
                    title="RGPD & Protection des données"
                    description="Absencia s'engage à ce que la collecte et le traitement de vos données, effectués à partir du site, soient conformes au règlement général sur la protection des données (RGPD)."
                >
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                            Les données personnelles collectées (Nom, Email, Type de contrat) sont uniquement utilisées pour le fonctionnement technique de l&apos;application Absencia (gestion de planning d&apos;équipe). Aucune donnée n&apos;est transmise à des tiers à des fins commerciales.
                        </p>
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs text-emerald-400 font-medium">
                                Vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;opposition aux données personnelles vous concernant. Pour l&apos;exercer, contactez-nous via la page Contact.
                            </p>
                        </div>
                    </div>
                </LegalSection>

                <LegalSection
                    icon={Eye}
                    title="Cookies & Traceurs"
                    description="Le site Absencia utilise des cookies uniquement pour la gestion de l'authentification et les préférences d'affichage (Thème sombre)."
                >
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                        Ces cookies sont strictement nécessaires au fonctionnement du service et ne nécessitent pas de consentement préalable selon les directives de la CNIL. Absencia n&apos;utilise aucun traceur publicitaire ou outil d&apos;analyse tiers intrusif.
                    </p>
                </LegalSection>

                <footer className="pt-10 text-center border-t border-white/5">
                    <p className="text-xs text-[var(--text-disabled)] uppercase tracking-widest font-bold">
                        Dernière mise à jour le 9 Mars 2026 par Adam Beloucif
                    </p>
                </footer>
            </div>
        </div>
    );
}

interface LegalSectionProps {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}

function LegalSection({ icon: Icon, title, description, children }: LegalSectionProps) {
    return (
        <section className="animate-fade-up opacity-0">
            <Card className="glass-elevated border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden shadow-sm">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)] border border-white/5">
                            <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-xl font-black text-white">{title}</CardTitle>
                    </div>
                    <p className="text-[var(--text-tertiary)] text-sm leading-relaxed border-l-2 border-emerald-500/30 pl-4 py-1 italic">
                        {description}
                    </p>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    {children}
                </CardContent>
            </Card>
        </section>
    );
}
