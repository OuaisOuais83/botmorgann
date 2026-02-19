@echo off
echo.
echo ========================================
echo   STATUT DU BOT
echo ========================================
echo.

cd /d "%~dp0"

pm2 status

echo.
pause
