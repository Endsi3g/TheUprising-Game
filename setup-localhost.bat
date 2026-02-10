@echo off
:: Desactive l'affichage des commandes pour plus de clarte
setlocal
:: Force l'encodage UTF-8 pour les accents et emojis
chcp 65001 >nul 2>&1
title The Uprising Game — Local Setup

echo.
echo ══════════════════════════════════════════════════════
echo        THE UPRISING GAME — INSTALLATION LOCALE
echo ══════════════════════════════════════════════════════
echo.

set "ERR_LOG=setup_error.log"
if exist "%ERR_LOG%" del "%ERR_LOG%"

:: ──────────────────────────────────────────────────────────
::  1. Verifier Node.js
:: ──────────────────────────────────────────────────────────
echo [1/5] Vérification de Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERREUR : Node.js n'est pas installe.
    echo    Veuillez l'installer sur https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo    ✅ Node.js %NODE_VERSION% détecté.

:: ──────────────────────────────────────────────────────────
::  2. Verifier Docker
:: ──────────────────────────────────────────────────────────
echo [2/5] Vérification de Docker...
where docker >nul 2>&1
if errorlevel 1 (
    echo    ⚠️ Docker absent. L'IA locale (Ollama) ne sera pas disponible.
) else (
    echo    ✅ Docker détecté. Lancement de la stack IA...
    docker-compose up -d >nul 2>&1
    if errorlevel 1 (
        echo [!] Docker Compose a echoue. >> "%ERR_LOG%"
        echo    ⚠️ Docker Compose a échoué. Poursuite sans IA locale.
    ) else (
        echo    ✅ Stack IA lancée.
    )
)
echo.

:: ──────────────────────────────────────────────────────────
::  3. Configuration .env
:: ──────────────────────────────────────────────────────────
echo [3/5] Configuration de l'environnement...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo    ⚠️ Nouveau fichier .env créé à partir de .env.example.
    ) else (
        echo ❌ ERREUR : .env.example introuvable.
        pause
        exit /b 1
    )
) else (
    echo    ✅ Fichier .env prêt.
)
echo.

:: ──────────────────────────────────────────────────────────
::  4. Installation des dependances
:: ──────────────────────────────────────────────────────────
echo [4/5] Installation des dépendances (npm install)...
echo    Cela peut prendre quelques minutes...
call npm install --no-fund --no-audit >nul 2>> "%ERR_LOG%"
if errorlevel 1 (
    echo.
    echo ❌ ERREUR : L'installation a échoué.
    if exist "%ERR_LOG%" type "%ERR_LOG%"
    echo.
    echo Suggestions :
    echo 1. Vérifiez votre connexion internet.
    echo 2. Fermez toutes les instances de Node.js.
    echo.
    pause
    exit /b 1
)
echo    ✅ Dépendances installées.
echo.

:: ──────────────────────────────────────────────────────────
::  5. Lancement
:: ──────────────────────────────────────────────────────────
echo ══════════════════════════════════════════════════════
echo   🚀 Prêt à lancer !
echo   📍 App : http://localhost:3000
echo   🛑 Quitter : Ctrl+C dans ce terminal
echo ══════════════════════════════════════════════════════
echo.
echo Appuyez sur une touche pour démarrer le serveur...
pause >nul

call npm run dev
if errorlevel 1 (
    echo.
    echo ❌ Le serveur s'est arrete avec une erreur.
    pause
)
exit /b 0
