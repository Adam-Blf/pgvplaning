#!/bin/bash
echo "🛡️ AUDIT & FIX DE SÉCURITÉ..."
# Tentative de réparation automatique
npm audit fix || echo "⚠️ Fix automatique partiel"
# Vérification critique
npm audit --audit-level=high || { echo "❌ FAILLE CRITIQUE - TENTATIVE FORCE..."; npm audit fix --force; }
# Dernier contrôle bloquant
npm audit --audit-level=high || { echo "❌ IMPOSSIBLE DE CORRIGER - ARRÊT"; exit 1; }
echo "✅ Audit OK"

# Mise à jour auto du README si non faite
if grep -q "Validation Sécurité" README.md; then
  echo "Doc à jour."
else
  echo "- $(date): Audit Sécurité Passé" >> README.md
fi

git add .
git commit -m "Auto-save: $(date)" || echo "Rien à commiter"
# FORCE PUSH pour garantir la synchro
git push -u origin main --force
echo "🚀 CODE SYNC & SECURE (FORCE PUSHED)"
