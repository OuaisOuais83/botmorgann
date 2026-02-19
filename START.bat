@echo off
echo ========================================
echo   CASINO DISCORD BOT - DEMARRAGE
echo ========================================
echo.

REM Vérifier si .env existe
if not exist .env (
    echo [ERREUR] Fichier .env introuvable!
    echo.
    echo ETAPE 1: Copie le fichier .env.example vers .env
    echo ETAPE 2: Ouvre .env avec Notepad
    echo ETAPE 3: Remplace VOTRE_TOKEN_ICI par ton vrai token Discord
    echo.
    pause
    exit
)

REM Vérifier si node_modules existe
if not exist node_modules (
    echo Installation des dependances...
    echo Cela peut prendre 1-2 minutes la premiere fois...
    echo.
    call npm install
    echo.
)

echo Demarrage du bot...
echo.
echo [INFO] Le bot est maintenant EN LIGNE!
echo [INFO] Pour arreter le bot, ferme cette fenetre ou utilise STOP.bat
echo.
echo ========================================
echo.

node src/index.js

pause
