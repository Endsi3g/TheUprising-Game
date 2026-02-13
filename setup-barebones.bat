@echo off
title The Uprising Game — Barebones
echo [FAST BOOT] Starting...

:: Fast install (only if needed generally, but here we force for consistency)
echo [1/3] Syncing dependencies...
call npm install --prefer-offline --no-audit --no-fund --silent

:: Start Docker (modern command)
echo [2/3] Checking Docker...
docker compose up -d >nul 2>&1

echo [3] Skipped Docker auto-start. Run start-docker.bat if needed.

echo [4] Starting App...
npm run dev
pause
