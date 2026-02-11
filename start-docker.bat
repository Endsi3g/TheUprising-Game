@echo off
title The Uprising Game - Docker
echo Starting Docker services...
docker-compose up -d
if errorlevel 1 (
    echo Failed to start Docker services. Make sure Docker Desktop is running.
    pause
) else (
    echo Docker services started successfully!
    timeout /t 3
)
