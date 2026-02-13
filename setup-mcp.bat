@echo off
setlocal EnableDelayedExpansion
:: Force UTF-8
chcp 65001 >nul 2>&1
title The Uprising Game — MCP Setup

echo.
echo ══════════════════════════════════════════════════════
echo        SUPABASE MCP CONFIGURATION
echo ══════════════════════════════════════════════════════
echo.
echo This script will generate the configuration file needed
echo for the AI Agent to access your Supabase database.
echo.
echo You need a Personal Access Token (PAT) from:
echo https://supabase.com/dashboard/account/tokens
echo.

set /p TOKEN="Enter your Supabase Access Token: "

if "%TOKEN%"=="" (
    echo.
    echo ❌ Token cannot be empty.
    pause
    exit /b 1
)

:: Create .vscode directory if it doesn't exist
if not exist ".vscode" mkdir ".vscode"

:: Write mcp.json
(
echo {
echo   "mcpServers": {
echo     "supabase": {
echo       "command": "npx",
echo       "args": [
echo         "-y",
echo         "@supabase/mcp-server",
echo         "--access-token",
echo         "%TOKEN%"
echo       ],
echo       "env": {
echo         "SUPABASE_ACCESS_TOKEN": "%TOKEN%"
echo       }
echo     }
echo   }
echo }
) > .vscode/mcp.json

echo.
echo ✅ Configuration saved to .vscode/mcp.json
echo.
echo ⚠️  IMPORTANT RECALL:
echo    You likely still need to fix the App's API Key manually!
echo    Edit .env.local and replace 'placeholder-service-role-key'
echo    with your actual Service Role Secret.
echo.
pause
