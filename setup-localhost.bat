@echo off
setlocal EnableDelayedExpansion
:: Force UTF-8 for special characters
chcp 65001 >nul 2>&1
title The Uprising Game — Standard Setup

echo.
echo ══════════════════════════════════════════════════════
echo        THE UPRISING GAME — STANDARD SETUP
echo ══════════════════════════════════════════════════════
echo.

set "ERR_LOG=setup_error.log"
if exist "%ERR_LOG%" del "%ERR_LOG%"

:: 1. Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed.
    echo    Please install it from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo    ✅ Node.js !NODE_VERSION! detected.

:: 2. Check Docker (Optional but recommended)
echo.
echo [2/5] Checking Docker...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️ Docker not found. Local AI/DB features may not work.
) else (
    echo    ✅ Docker detected. Starting services...
    
    :: Try modern "docker compose" first
    docker compose up -d >nul 2>docker_err.log
    if !errorlevel! neq 0 (
        :: Fallback to legacy "docker-compose" if needed, though unlikely on modern Docker Desktop
        docker-compose up -d >nul 2>>docker_err.log
        if !errorlevel! neq 0 (
            echo    ⚠️ Docker Compose failed to start. Details:
            type docker_err.log
            echo.
            echo    (Continuing without local AI/DB stack...)
        ) else (
            echo    ✅ Docker services started (legacy command).
        )
    ) else (
        echo    ✅ Docker services started.
    )
    if exist docker_err.log del docker_err.log
)

:: 3. Setup Environment
echo.
echo [3/5] configuring Environment...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo    ✅ Created .env from .env.example
    ) else (
        echo    ⚠️ .env.example not found. Skipping .env creation.
    )
) else (
    echo    ✅ .env already exists.
)

:: 4. Install Dependencies
echo.
echo [4/5] Installing Dependencies...
call npm install --no-fund --no-audit
if %errorlevel% neq 0 (
    echo ❌ ERROR: npm install failed.
    pause
    exit /b 1
)
echo    ✅ Dependencies installed.

:: 5. Launch
echo.
echo ══════════════════════════════════════════════════════
echo   🚀 STARTING DEVELOPMENT SERVER
echo   APP: http://localhost:3000
echo ══════════════════════════════════════════════════════
echo.

call npm run dev
if %errorlevel% neq 0 (
    echo ❌ Server exited with error code %errorlevel%.
    pause
)
exit /b 0
