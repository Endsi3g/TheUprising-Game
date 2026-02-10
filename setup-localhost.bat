@echo off
chcp 65001 >nul 2>&1
title The Uprising Game — Local Setup
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║       THE UPRISING GAME — LOCALHOST DEPLOYMENT       ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM ──────────────────────────────────────────────────────────
REM  1. Vérifier que Node.js est installé
REM ──────────────────────────────────────────────────────────
echo [1/5] Vérification de Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌  Node.js n'est pas installé ou n'est pas dans le PATH.
    echo     Télécharge-le ici : https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo     ✅  Node.js %NODE_VERSION% détecté.

REM ──────────────────────────────────────────────────────────
REM  2. Vérifier que Docker est installé (Optionnel mais recommandé)
REM ──────────────────────────────────────────────────────────
echo [2/5] Vérification de Docker (pour Ollama)...
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo     ⚠️  Docker n'est pas détecté. L'IA locale (Ollama) ne pourra pas être lancée automatiquement.
    echo        Si vous utilisez OpenAI, vous pouvez ignorer ce message.
) else (
    echo     ✅  Docker détecté.
    echo     🚀  Lancement de la stack Ollama (docker-compose up)...
    docker-compose up -d >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo     ⚠️  Échec du lancement de Docker Compose. Assurez-vous que Docker Desktop est lancé.
    ) else (
        echo     ✅  Stack IA locale initialisée.
    )
)
echo.

REM ──────────────────────────────────────────────────────────
REM  3. Fichier .env
REM ──────────────────────────────────────────────────────────
echo [3/5] Vérification du fichier .env...
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo     ⚠️  Fichier .env créé à partir de .env.example.
        echo     👉  IMPORTANT : ouvre le fichier .env et remplis tes clés :
        echo         - NEXT_PUBLIC_SUPABASE_URL
        echo         - SUPABASE_SERVICE_ROLE_KEY
        echo         - OPENAI_API_KEY (si utilisé)
        echo.
    ) else (
        echo     ❌  Aucun fichier .env ni .env.example trouvé.
        echo.
        pause
        exit /b 1
    )
) else (
    echo     ✅  Fichier .env existant détecté.
)
echo.

REM ──────────────────────────────────────────────────────────
REM  4. Installation des dépendances
REM ──────────────────────────────────────────────────────────
echo [4/5] Installation des dépendances (npm install)...
echo     Cela peut prendre quelques minutes...
echo.
cd /d "%~dp0"
call npm install --no-fund --no-audit
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌  Échec de l'installation des dépendances.
    echo.
    pause
    exit /b 1
)
echo     ✅  Dépendances installées.
echo.

REM ──────────────────────────────────────────────────────────
REM  5. Lancement du serveur de développement
REM ──────────────────────────────────────────────────────────
echo ══════════════════════════════════════════════════════
echo   🚀  Lancement du serveur de développement...
echo   📍  L'app sera disponible sur : http://localhost:3000
echo   🛑  Pour arrêter : appuie sur Ctrl+C dans ce terminal
echo ══════════════════════════════════════════════════════
echo.
call npm run dev
