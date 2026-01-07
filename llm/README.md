# PGV Planning - LLM Custom

## Installation rapide avec Ollama

### 1. Installer Ollama

```bash
# Windows
winget install Ollama.Ollama

# Mac
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Télécharger le modèle de base

```bash
# Option A: Qwen 2.5 3B (recommandé, 1.5 GB)
ollama pull qwen2.5:3b

# Option B: Mistral 7B (meilleure qualité, 4.1 GB)
ollama pull mistral
```

### 3. Créer le modèle personnalisé PGV

```bash
cd llm
ollama create pgv-absence -f Modelfile
```

### 4. Tester le modèle

```bash
ollama run pgv-absence "Rédige un message d'absence pour Jean Dupont. Raison: congés. Ton: professionnel."
```

### 5. Configurer l'application

Dans PGV Planning > Paramètres :
- **URL Endpoint**: `http://localhost:11434/v1/chat/completions`
- **Clé API**: (laisser vide)

---

## Fine-tuning avancé (optionnel)

Pour améliorer les réponses avec vos propres exemples :

### Prérequis

```bash
pip install unsloth torch transformers datasets trl
```

### Ajouter des exemples

Éditez `dataset/absence_messages.jsonl` avec vos propres messages.

### Lancer le fine-tuning

```bash
cd llm
python finetune.py
```

### Créer le modèle Ollama fine-tuné

```bash
ollama create pgv-absence-ft -f Modelfile.finetuned
```

---

## Structure des fichiers

```
llm/
├── Modelfile              # Config Ollama (modèle de base)
├── finetune.py            # Script de fine-tuning
├── dataset/
│   └── absence_messages.jsonl  # Dataset d'entraînement
└── README.md
```

---

## API Compatible

Le modèle utilise l'API OpenAI compatible. Exemple d'appel :

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "pgv-absence",
    "messages": [
      {"role": "user", "content": "Rédige un message d'absence pour Marie. Raison: formation. Ton: amical."}
    ]
  }'
```
