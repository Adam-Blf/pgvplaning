# Guide de Migration : absencia.beloucif.com

Ce guide t'accompagne pour finaliser la migration technique sur Vercel et assurer ton indexation sur Google.

## Étape 1 : Configuration Vercel

1. **Ajouter le domaine** :
   - Va sur ton dashboard [Vercel](https://vercel.com).
   - Sélectionne ton projet **pgvplaning**.
   - Va dans **Settings** > **Domains**.
   - Clique sur **Add** et saisis `absencia.beloucif.com`.
   - Vercel te donnera des enregistrements DNS (CNAME ou A) à ajouter chez ton hébergeur (beloucif.com).

2. **Gérer l'ancien domaine** :
   - Une fois le nouveau domaine actif, clique sur **Edit** à côté de l'ancien domaine `planning.beloucif.com`.
   - Configure une **Redirect** (301 - Permanent) vers `absencia.beloucif.com`.
   - Cela transfère ton autorité SEO de l'ancien vers le nouveau nom.

3. **Variables d'Environnement** :
   - J'ai déjà mis à jour ton `.env.local`, mais n'oublie pas de vérifier sur Vercel :
   - `NEXT_PUBLIC_APP_URL` doit être égal à `https://absencia.beloucif.com`.

## Étape 2 : Recensement Google (SEO)

J'ai déjà créé les fichiers nécessaires dans le code (`sitemap.xml` et `robots.txt`). Voici comment les utiliser :

1. **Google Search Console** :
   - Va sur [Google Search Console](https://search.google.com/search-console).
   - **IMPORTANT** : Choisis le type de propriété **Domaine** (à gauche).
   - Entre : `absencia.beloucif.com`.
   - **Pourquoi ce choix ?** Cela permet de valider automatiquement toutes les variantes (http, https, avec ou sans www) en une seule fois via tes DNS.
   - Copie la valeur de l'enregistrement TXT fourni par Google et ajoute-la dans ta zone DNS (chez ton hébergeur de domaine).

2. **Soumettre le Sitemap** :
   - Dans le menu de gauche, clique sur **Sitemaps**.
   - Entre l'URL : `https://absencia.beloucif.com/sitemap.xml`.
   - Clique sur **Envoyer**. Google va maintenant parcourir et indexer toutes tes pages.

3. **Demande d'Indexation** :
   - Tu peux coller l'URL de ta page d'accueil dans la barre de recherche en haut de Search Console et cliquer sur **Demander une indexation** pour accélérer le processus.

## Points Techniques Clés (déjà faits dans le code)

- **Canonicals** : J'ai ajouté des balises `<link rel="canonical">` pour éviter le contenu dupliqué.
- **Metadata** : Titres et descriptions optimisés pour le mot-clé "Absencia".
- **OpenGraph** : Configuration prête pour un affichage parfait sur WhatsApp, Facebook et LinkedIn.

---
**Besoin d'aide ?** N'hésite pas à me demander si une étape DNS te bloque !
