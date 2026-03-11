# Script de finetuning Mistral 7B
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer, TextDataset, DataCollatorForLanguageModeling
import torch

MODEL_PATH = "./models/mistral-7B-v0.1"
DATA_PATH = "./data/finetune.txt"  # À créer

model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

def get_dataset(tokenizer, file_path):
    return TextDataset(
        tokenizer=tokenizer,
        file_path=file_path,
        block_size=128
    )

def main():
    train_dataset = get_dataset(tokenizer, DATA_PATH)
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )
    training_args = TrainingArguments(
        output_dir="./models/mistral-finetuned",
        overwrite_output_dir=True,
        num_train_epochs=3,
        per_device_train_batch_size=2,
        save_steps=500,
        save_total_limit=2,
        prediction_loss_only=True
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=train_dataset
    )
    trainer.train()
    model.save_pretrained("./models/mistral-finetuned")
    tokenizer.save_pretrained("./models/mistral-finetuned")
    print("Finetuning terminé.")

if __name__ == "__main__":
    main()
