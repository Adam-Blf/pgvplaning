# PGV Planning - LLM Custom (pgv-absence)

Modèle d'IA local optimisé pour la génération de messages d'absence professionnels en français.

---

## Installation Rapide (Recommandée)

### Windows (PowerShell)

```powershell
cd llm
.\install.ps1
```

### Linux / macOS

```bash
cd llm
chmod +x install.sh
./install.sh
```

---

## Installation Manuelle

### 1. Télécharger Ollama

| Plateforme | Commande / Lien |
|------------|-----------------|
| **Windows** | `winget install Ollama.Ollama` |
| **macOS** | `brew install ollama` |
| **Linux** | `curl -fsSL https://ollama.com/install.sh \| sh` |
| **Direct** | [https://ollama.com/download](https://ollama.com/download) |

### 2. Démarrer Ollama

```bash
ollama serve
```

### 3. Télécharger le modèle de base

```bash
# Option recommandée: Qwen 2.5 3B (1.5 GB - rapide)
ollama pull qwen2.5:3b

# Option qualité: Mistral 7B (4.1 GB - meilleur résultat)
ollama pull mistral
```

### 4. Créer le modèle personnalisé

```bash
cd llm
ollama create pgv-absence -f Modelfile
```

### 5. Tester le modèle

```bash
ollama run pgv-absence "Rédige un message d'absence pour Jean. Raison: congés. Ton: professionnel."
```

---

## Configuration dans PGV Planning

1. Ouvrir l'application PGV Planning
2. Aller dans **Paramètres** (icône engrenage)
3. Section **Configuration LLM**
4. Cliquer sur le bouton **"Ollama (Local)"**
   - Ou entrer manuellement: `http://localhost:11434/v1/chat/completions`
5. Laisser la clé API vide
6. Sauvegarder

---

## Caractéristiques du Modèle

### Capacités

| Fonctionnalité | Description |
|----------------|-------------|
| **Tons** | Professionnel, Amical, Formel |
| **Raisons** | Congés, Formation, Maladie, Déplacement, RTT, Maternité/Paternité, Télétravail... |
| **Balises** | `[DATE_RETOUR]`, `[DATE_DEBUT]`, `[NOM_CONTACT]`, `[EMAIL_CONTACT]` |
| **Format** | Corps du message uniquement (5-8 lignes) |

### Exemples de Prompts

```
Rédige un message d'absence pour Marie Dupont. Raison: congés. Ton: professionnel.

Rédige un message d'absence pour Thomas. Raison: formation certifiante. Ton: amical.

Rédige un message d'absence pour Sophie Martin. Raison: déplacement international. Ton: formel.
```

---

## Fine-tuning Avancé (Optionnel)

Pour améliorer les réponses avec vos propres exemples d'entreprise.

### Prérequis GPU (NVIDIA)

```bash
pip install unsloth torch transformers datasets trl
```

### Prérequis CPU uniquement

```bash
pip install torch transformers datasets trl accelerate
```

### Ajouter vos exemples

Éditez `dataset/absence_messages.jsonl` avec vos propres messages au format:

```json
{"messages": [
  {"role": "system", "content": "Tu es un assistant RH..."},
  {"role": "user", "content": "Rédige un message d'absence pour [NOM]. Raison: [RAISON]. Ton: [TON]."},
  {"role": "assistant", "content": "Le message attendu..."}
]}
```

### Lancer le fine-tuning

```bash
# Avec GPU NVIDIA
python finetune.py

# CPU uniquement (plus lent)
python finetune_cpu.py
```

### Utiliser le modèle fine-tuné

Après le fine-tuning, créez un nouveau Modelfile pointant vers le modèle local:

```bash
ollama create pgv-absence-ft -f Modelfile.finetuned
```

---

## Structure des Fichiers

```
llm/
├── Modelfile              # Configuration Ollama (modèle pgv-absence)
├── install.ps1            # Script installation Windows
├── install.sh             # Script installation Linux/Mac
├── finetune.py            # Fine-tuning GPU (Unsloth)
├── finetune_cpu.py        # Fine-tuning CPU
├── dataset/
│   └── absence_messages.jsonl  # 34 exemples d'entraînement
└── README.md              # Ce fichier
```

---

## API Compatible OpenAI

Le modèle utilise l'API compatible OpenAI. Exemple avec curl:

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "pgv-absence",
    "messages": [
      {"role": "user", "content": "Rédige un message d'absence pour Marie. Raison: formation. Ton: amical."}
    ],
    "temperature": 0.7
  }'
```

Réponse:

```json
{
  "choices": [{
    "message": {
      "content": "Hello !\n\nJe suis en formation..."
    }
  }]
}
```

---

## Dépannage

### Ollama ne démarre pas

```bash
# Vérifier si le port est occupé
netstat -an | findstr 11434

# Tuer le processus existant
taskkill /F /IM ollama.exe
ollama serve
```

### Modèle pas trouvé

```bash
# Vérifier les modèles installés
ollama list

# Recréer le modèle
ollama create pgv-absence -f Modelfile
```

### Erreur de connexion depuis l'app

1. Vérifier qu'Ollama tourne: `ollama list`
2. Tester l'API: `curl http://localhost:11434/api/version`
3. Vérifier le pare-feu Windows

---

## Performances

| Modèle Base | VRAM | Temps réponse | Qualité |
|-------------|------|---------------|---------|
| Qwen 2.5 3B | 3 GB | ~2-3s | ⭐⭐⭐⭐ |
| Mistral 7B | 6 GB | ~4-5s | ⭐⭐⭐⭐⭐ |
| Llama 3.2 3B | 3 GB | ~2-3s | ⭐⭐⭐⭐ |

---

## Licence

MIT License - PGV Planning V9

Modèle basé sur Qwen 2.5 (Alibaba) sous licence Apache 2.0.
