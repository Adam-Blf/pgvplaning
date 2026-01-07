"""
Script de Fine-tuning pour PGV Planning - Version CPU
Optimisé pour fonctionner sans GPU NVIDIA

Utilise PEFT/LoRA pour un fine-tuning efficace sur CPU
"""

import json
import os
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
import torch

# Configuration
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"  # Modèle plus petit pour CPU
OUTPUT_DIR = "./pgv-absence-model"
MAX_SEQ_LENGTH = 256
LORA_R = 8
LORA_ALPHA = 16
EPOCHS = 3

def load_dataset(file_path: str) -> Dataset:
    """Charge le dataset JSONL"""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    return Dataset.from_list(data)

def format_prompt(example, tokenizer):
    """Formate les messages pour le fine-tuning au format ChatML"""
    messages = example['messages']
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
    return {"text": text}

def main():
    print("=" * 50)
    print("PGV Planning - Fine-tuning LLM (CPU)")
    print("=" * 50)

    # Vérifier le device
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"\nDevice: {device}")

    if device == "cpu":
        print("Mode CPU détecté - utilisation d'un modèle plus petit")
        os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

    # Charger le tokenizer
    print("\n1. Chargement du tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        tokenizer.pad_token_id = tokenizer.eos_token_id

    # Charger le modèle
    print("2. Chargement du modèle...")

    if device == "cuda":
        # Configuration avec quantization pour GPU
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
        )
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
        )
        model = prepare_model_for_kbit_training(model)
    else:
        # Configuration pour CPU
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float32,
            trust_remote_code=True,
            low_cpu_mem_usage=True,
        )

    # Configurer LoRA
    print("3. Configuration LoRA...")
    lora_config = LoraConfig(
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # Charger et préparer le dataset
    print("4. Préparation du dataset...")
    dataset = load_dataset("./dataset/absence_messages.jsonl")

    def process_example(example):
        return format_prompt(example, tokenizer)

    dataset = dataset.map(process_example)

    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=MAX_SEQ_LENGTH,
            padding="max_length",
        )

    tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=dataset.column_names)

    print(f"   - {len(tokenized_dataset)} exemples chargés")

    # Configuration de l'entraînement
    print("5. Configuration de l'entraînement...")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        warmup_steps=2,
        num_train_epochs=EPOCHS,
        learning_rate=2e-4,
        logging_steps=1,
        save_strategy="epoch",
        seed=42,
        fp16=False,  # Désactivé pour CPU
        bf16=False,
        optim="adamw_torch",
        report_to="none",
        use_cpu=device == "cpu",
    )

    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
    )

    # Fine-tuning
    print("6. Démarrage du fine-tuning...")
    print("   (Cela peut prendre plusieurs minutes sur CPU)\n")

    trainer.train()

    # Sauvegarder le modèle
    print("\n7. Sauvegarde du modèle...")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Fusionner LoRA avec le modèle de base pour export
    print("8. Fusion LoRA + modèle de base...")
    merged_model = model.merge_and_unload()
    merged_model.save_pretrained(OUTPUT_DIR + "-merged")
    tokenizer.save_pretrained(OUTPUT_DIR + "-merged")

    print("\n" + "=" * 50)
    print("Fine-tuning terminé !")
    print(f"Modèle LoRA sauvegardé dans: {OUTPUT_DIR}")
    print(f"Modèle fusionné sauvegardé dans: {OUTPUT_DIR}-merged")
    print("=" * 50)

    # Test du modèle
    print("\n9. Test du modèle fine-tuné...")
    test_prompt = "Rédige un message d'absence pour Adam. Raison: congés. Ton: professionnel."

    messages = [
        {"role": "system", "content": "Tu es un assistant RH qui rédige des messages d'absence professionnels en français."},
        {"role": "user", "content": test_prompt}
    ]

    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt")

    if device == "cuda":
        inputs = inputs.to("cuda")

    outputs = merged_model.generate(
        **inputs,
        max_new_tokens=150,
        temperature=0.7,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print("\nRéponse du modèle:")
    print("-" * 40)
    # Extraire seulement la réponse de l'assistant
    if "assistant" in response.lower():
        response = response.split("assistant")[-1].strip()
    print(response)
    print("-" * 40)

    print("\nPour convertir en GGUF pour Ollama:")
    print("1. pip install llama-cpp-python")
    print(f"2. python -m llama_cpp.convert {OUTPUT_DIR}-merged --outfile pgv-absence.gguf")
    print("3. ollama create pgv-absence -f Modelfile-gguf")

if __name__ == "__main__":
    main()
