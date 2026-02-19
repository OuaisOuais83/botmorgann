@echo off
echo.
echo ========================================
echo   VOIR LES LOGS DU BOT
echo ========================================
echo.

cd /d "%~dp0"

echo Affichage des logs en temps reel...
echo Appuyez sur Ctrl+C pour arreter
echo.

pm2 logs farmer-league-bot
