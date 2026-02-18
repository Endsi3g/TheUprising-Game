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
echo [1/4] Vérification de Node.js...
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
REM  2. Vérifier que npm est installé
REM ──────────────────────────────────────────────────────────
echo [2/4] Vérification de npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌  npm n'est pas installé ou n'est pas dans le PATH.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo     ✅  npm v%NPM_VERSION% détecté.
echo.

REM ──────────────────────────────────────────────────────────
REM  3. Fichier .env
REM ──────────────────────────────────────────────────────────
echo [3/4] Vérification du fichier .env...
if not exist "%~dp0..\.env" (
    if exist "%~dp0..\.env.example" (
        copy "%~dp0..\.env.example" "%~dp0..\.env" >nul
        echo     ⚠️  Fichier .env créé à partir de .env.example.
        echo     👉  IMPORTANT : ouvre le fichier .env et remplis tes clés API avant de continuer.
        echo.
    ) else (
        echo     ❌  Aucun fichier .env ni .env.example trouvé.
        echo     👉  Crée un fichier .env à la racine du projet avec tes variables d'environnement.
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
echo [4/4] Installation des dépendances (npm install)...
echo     Cela peut prendre quelques minutes...
echo.
cd /d "%~dp0.."
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌  Échec de l'installation des dépendances.
    echo     Vérifie les erreurs ci-dessus et réessaie.
    echo.
    pause
    exit /b 1
)
echo.
echo     ✅  Dépendances installées avec succès.
echo.

REM ──────────────────────────────────────────────────────────
REM  Lancement du serveur de développement
REM ──────────────────────────────────────────────────────────
echo ══════════════════════════════════════════════════════
echo   🚀  Lancement du serveur de développement...
echo   📍  L'app sera disponible sur : http://localhost:3000
echo   🛑  Pour arrêter : appuie sur Ctrl+C dans ce terminal
echo ══════════════════════════════════════════════════════
echo.
call npm run dev
