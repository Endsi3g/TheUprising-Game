@echo off
title The Uprising Game - Setup
echo Starting setup...

echo [1] Checking Node.js...
node -v
if errorlevel 1 (
    echo Node.js not found. Please install from nodejs.org
    pause
    exit /b
)

echo [2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Install failed.
    pause
    exit /b
)

echo [3] Checking Docker...
docker -v
if errorlevel 0 (
    echo Starting Docker services...
    docker-compose up -d
)

echo [4] Starting App...
npm run dev
pause
