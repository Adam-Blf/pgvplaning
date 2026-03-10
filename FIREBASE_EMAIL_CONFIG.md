# Configuration de l'Email de Vérification Firebase

Pour personnaliser l'email que tes utilisateurs reçoivent, tout se passe dans la **Console Firebase**. Voici la marche à suivre :

## 1. Accéder aux modèles

1. Va sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Sélectionne ton projet **Absencia** (ou pgvplaning).
3. Dans le menu de gauche, clique sur **Authentication**.
4. Clique sur l'onglet **Templates** (ou Modèles) en haut.

## 2. Modifier le lien de vérification

1. Dans la liste à gauche, sélectionne **Email address verification**.
2. Tu peux ici modifier :
   - **L'expéditeur** (Nom que l'utilisateur verra).
   - **L'objet du mail** (ex: "Bienvenue sur Absencia ! Vérifiez votre compte").
   - **Le corps du message** : Clique sur l'icône de crayon pour éditer le texte.

> [!IMPORTANT]
> Ne modifie pas le lien `%LINK%`, c'est lui qui permet à Firebase de valider l'email.

## 3. Configuration de l'expéditeur personnalisé (Domaine)

Par défaut, l'email vient de `noreply@votre-projet.firebaseapp.com`.
Pour utiliser ta propre adresse (ex: `contact@beloucif.com`) :

1. Dans la même page (Authentication > Templates), clique sur l'icône de paramètres (roue crantée) à côté de "Sender identity".
2. Suis les instructions pour ajouter ton propre domaine et valider les enregistrements DNS chez ton hébergeur.

---

# Prochaines étapes

- [x] Crash corrigé (double-clic sur les paramètres).
- [x] Connexion bloquée si l'email n'est pas vérifié.
- [x] Paramètres de collaboration ajoutés dans la page de gestion d'équipe.
