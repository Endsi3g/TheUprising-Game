#!/bin/bash
echo "[SETUP] Checking if Ollama container is running..."

if ! docker ps | grep -q salon-ai-ollama; then
    echo "[ERROR] Ollama container is NOT running."
    echo "Please run 'docker-compose up -d' first."
    exit 1
fi

echo "[SETUP] Pulling Llama 3 (8B) model... This may take a while."
docker exec -it salon-ai-ollama ollama pull llama3

echo ""
echo "[SETUP] Pulling Mistral (optional fallback)..."
docker exec -it salon-ai-ollama ollama pull mistral

echo ""
echo "[SUCCESS] Models pulled! You can now use the AI."
