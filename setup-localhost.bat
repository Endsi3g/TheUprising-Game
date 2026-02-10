@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title The Uprising Game — Local Setup
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║       THE UPRISING GAME — LOCALHOST DEPLOYMENT       ║
echo ╚══════════════════════════════════════════════════════╝
echo.

set "ERR_LOG=setup_error.log"
if exist "%ERR_LOG%" del "%ERR_LOG%"

REM ──────────────────────────────────────────────────────────
REM  1. Vérifier Node.js
REM ──────────────────────────────────────────────────────────
echo [1/5] Vérification de Node.js...
where node >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    call :handle_error "Node.js n'est pas installé ou n'est pas dans le PATH. Téléchargez-le sur https://nodejs.org/"
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo     ✅  Node.js !NODE_VERSION! détecté.

REM ──────────────────────────────────────────────────────────
REM  2. Vérifier Docker
REM ──────────────────────────────────────────────────────────
echo [2/5] Vérification de Docker...
where docker >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo     ⚠️  Docker absent. L'IA locale (Ollama) ne sera pas disponible.
) else (
    echo     ✅  Docker détecté. Lancement de la stack IA...
    docker-compose up -d >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo     ⚠️  Docker Compose a échoué. Vérifiez que Docker Desktop est lancé. >> "%ERR_LOG%"
        echo     ⚠️  Docker Compose a échoué. Poursuite sans IA locale.
    ) else (
        echo     ✅  Stack IA lancée.
    )
)
echo.

REM ──────────────────────────────────────────────────────────
REM  3. Configuration .env
REM ──────────────────────────────────────────────────────────
echo [3/5] Configuration de l'environnement...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo     ⚠️  Nouveau fichier .env créé.
    ) else (
        call :handle_error "Fichier .env.example introuvable. Impossible d'initialiser l'environnement."
    )
) else (
    echo     ✅  Fichier .env prêt.
)
echo.

REM ──────────────────────────────────────────────────────────
REM  4. Installation des dépendances
REM ──────────────────────────────────────────────────────────
echo [4/5] Installation des dépendances (npm install)...
echo     Cela peut prendre quelques minutes...
call npm install --no-fund --no-audit >nul 2>> "%ERR_LOG%"
if !ERRORLEVEL! NEQ 0 (
    call :handle_error "L'installation des dépendances a échoué. Consultez %ERR_LOG% pour plus de détails."
)
echo     ✅  Dépendances installées.
echo.

REM ──────────────────────────────────────────────────────────
REM  5. Vérification Finale
REM ──────────────────────────────────────────────────────────
if exist "%ERR_LOG%" (
    echo ⚠️  Des avertissements ont été enregistrés dans %ERR_LOG%
    echo.
)

echo ══════════════════════════════════════════════════════
echo   🚀  Prêt à lancer !
echo   📍  App : http://localhost:3000
echo   🛑  Quitter : Ctrl+C
echo ══════════════════════════════════════════════════════
echo.
pause
npm run dev
exit /b 0

:handle_error
echo.
echo ❌  ERREUR CRITIQUE : %~1
echo ──────────────────────────────────────────────────────────
if exist "%ERR_LOG%" (
    echo Détails de l'erreur enregistrés dans %ERR_LOG%
    type "%ERR_LOG%"
)
echo.
echo Suggestions :
echo 1. Vérifiez votre connexion internet.
echo 2. Assurez-vous d'avoir les droits administrateur.
echo 3. Essayez de supprimer 'node_modules' et de relancer.
echo.
pause
exit /b 1
