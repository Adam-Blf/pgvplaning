"""
Script de Fine-tuning pour PGV Planning
Utilise Unsloth pour un fine-tuning rapide et efficace sur GPU consumer

Prérequis:
    pip install unsloth
    pip install torch
    pip install transformers datasets
"""

import json
from unsloth import FastLanguageModel
from datasets import Dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# Configuration
MODEL_NAME = "unsloth/Qwen2.5-3B-Instruct"  # Modèle de base (petit et efficace)
OUTPUT_DIR = "./pgv-absence-model"
MAX_SEQ_LENGTH = 512
LORA_R = 16
LORA_ALPHA = 16
EPOCHS = 3

def load_dataset(file_path: str) -> Dataset:
    """Charge le dataset JSONL"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line))
    return Dataset.from_list(data)

def format_prompt(example):
    """Formate les messages pour le fine-tuning"""
    messages = example['messages']
    formatted = ""
    for msg in messages:
        role = msg['role']
        content = msg['content']
        if role == 'system':
            formatted += f"<|im_start|>system\n{content}<|im_end|>\n"
        elif role == 'user':
            formatted += f"<|im_start|>user\n{content}<|im_end|>\n"
        elif role == 'assistant':
            formatted += f"<|im_start|>assistant\n{content}<|im_end|>\n"
    return {"text": formatted}

def main():
    print("=" * 50)
    print("PGV Planning - Fine-tuning LLM")
    print("=" * 50)

    # Charger le modèle avec LoRA
    print("\n1. Chargement du modèle...")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        dtype=None,  # Auto-detect
        load_in_4bit=True,  # Utilise 4-bit quantization
    )

    # Configurer LoRA
    print("2. Configuration LoRA...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=LORA_R,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                       "gate_proj", "up_proj", "down_proj"],
        lora_alpha=LORA_ALPHA,
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
    )

    # Charger et préparer le dataset
    print("3. Préparation du dataset...")
    dataset = load_dataset("./dataset/absence_messages.jsonl")
    dataset = dataset.map(format_prompt)

    print(f"   - {len(dataset)} exemples chargés")

    # Configuration de l'entraînement
    print("4. Configuration de l'entraînement...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        num_train_epochs=EPOCHS,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=1,
        optim="adamw_8bit",
        save_strategy="epoch",
        seed=42,
    )

    # Trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LENGTH,
        args=training_args,
    )

    # Fine-tuning
    print("5. Démarrage du fine-tuning...")
    print("   (Cela peut prendre quelques minutes)\n")

    trainer.train()

    # Sauvegarder le modèle
    print("\n6. Sauvegarde du modèle...")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Export en GGUF pour Ollama
    print("7. Export en GGUF pour Ollama...")
    model.save_pretrained_gguf(
        OUTPUT_DIR + "-gguf",
        tokenizer,
        quantization_method="q4_k_m"  # Bonne balance taille/qualité
    )

    print("\n" + "=" * 50)
    print("Fine-tuning terminé !")
    print(f"Modèle sauvegardé dans: {OUTPUT_DIR}")
    print(f"GGUF pour Ollama dans: {OUTPUT_DIR}-gguf")
    print("=" * 50)

    # Instructions
    print("\nPour utiliser avec Ollama:")
    print("1. ollama create pgv-absence -f Modelfile")
    print("2. ollama run pgv-absence")
    print("\nPour utiliser avec vLLM:")
    print(f"   vllm serve {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
