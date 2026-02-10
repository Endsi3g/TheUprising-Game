@echo off
echo [SETUP] Checking if Ollama container is running...

docker ps | findstr salon-ai-ollama >nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama container is NOT running.
    echo Please run 'docker-compose up -d' first.
    pause
    exit /b 1
)

echo [SETUP] Pulling Llama 3 (8B) model... This may take a while.
docker exec -it salon-ai-ollama ollama pull llama3

echo.
echo [SETUP] Pulling Mistral (optional fallback)...
docker exec -it salon-ai-ollama ollama pull mistral

echo.
echo [SUCCESS] Models pulled! You can now use the AI.
pause
