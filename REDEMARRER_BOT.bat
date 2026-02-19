@echo off
echo.
echo ========================================
echo   REDEMARRAGE BOT FARMER LEAGUE
echo ========================================
echo.

cd /d "%~dp0"

echo Redemarrage du bot...
pm2 restart farmer-league-bot

echo.
echo Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo Verification du statut...
pm2 status

echo.
echo ========================================
echo   BOT REDEMARRE !
echo ========================================
echo.
echo Pour voir les logs en temps reel :
echo pm2 logs farmer-league-bot
echo.

pause
