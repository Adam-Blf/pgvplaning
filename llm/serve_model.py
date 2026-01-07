"""
Serveur API pour le modèle fine-tuné PGV Absence
Compatible avec l'API OpenAI pour une intégration facile
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import uvicorn
import time

app = FastAPI(title="PGV Absence LLM API", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger le modèle au démarrage
MODEL_PATH = "./pgv-absence-model-merged"
model = None
tokenizer = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str = "pgv-absence"
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 300
    stream: bool = False

class ChatChoice(BaseModel):
    index: int = 0
    message: Message
    finish_reason: str = "stop"

class ChatResponse(BaseModel):
    id: str = "chatcmpl-pgv"
    object: str = "chat.completion"
    created: int = 0
    model: str = "pgv-absence"
    choices: List[ChatChoice]

@app.on_event("startup")
async def load_model():
    global model, tokenizer
    print("Chargement du modèle fine-tuné...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        torch_dtype=torch.float32,
        trust_remote_code=True,
        low_cpu_mem_usage=True,
    )
    print("Modèle chargé avec succès!")

@app.get("/")
async def root():
    return {"status": "ok", "model": "pgv-absence", "version": "1.0"}

@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": "pgv-absence",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "pgv-planning"
            }
        ]
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest):
    global model, tokenizer

    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé")

    # Construire les messages au format ChatML
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Appliquer le template de chat
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt")

    # Générer la réponse
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=request.max_tokens,
            temperature=request.temperature if request.temperature > 0 else 0.7,
            do_sample=request.temperature > 0,
            pad_token_id=tokenizer.eos_token_id,
            top_p=0.9,
            repetition_penalty=1.1,
        )

    # Décoder la réponse
    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Extraire seulement la partie assistant
    if "<|im_start|>assistant" in full_response:
        response_text = full_response.split("<|im_start|>assistant")[-1]
        response_text = response_text.replace("<|im_end|>", "").strip()
    else:
        # Essayer d'extraire après le dernier message user
        parts = full_response.split("assistant")
        response_text = parts[-1].strip() if len(parts) > 1 else full_response

    return ChatResponse(
        created=int(time.time()),
        choices=[
            ChatChoice(
                message=Message(role="assistant", content=response_text)
            )
        ]
    )

if __name__ == "__main__":
    print("=" * 50)
    print("PGV Absence LLM - Serveur API")
    print("=" * 50)
    print("\nEndpoint: http://localhost:8080/v1/chat/completions")
    print("Compatible avec l'API OpenAI\n")
    uvicorn.run(app, host="127.0.0.1", port=8080)
