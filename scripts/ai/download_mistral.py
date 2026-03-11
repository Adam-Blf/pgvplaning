# Script to download Mistral 7B from Hugging Face
from huggingface_hub import snapshot_download

MODEL_ID = "mistral-7B-v0.1"

snapshot_download(
    repo_id=MODEL_ID,
    local_dir="./models/mistral-7B-v0.1",
    resume_download=True,
    use_auth_token=True  # Requires HF token
)
print("Download complete: ./models/mistral-7B-v0.1")
