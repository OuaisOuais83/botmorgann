@echo off
title Farmer League Bot - Refresh Commands
color 0A

echo ========================================
echo   REFRESH DISCORD COMMANDS
echo ========================================
echo.
echo Suppression du cache des commandes...
echo.

cd /d "%~dp0"

node -e "const { REST, Routes } = require('discord.js'); const fs = require('fs'); require('dotenv').config(); const commands = []; const commandFiles = fs.readdirSync('./src/commands'); for (const file of commandFiles) { if (file.endsWith('.js')) { const command = require(`./src/commands/${file}`); if (command.data) commands.push(command.data.toJSON()); } } const rest = new REST().setToken(process.env.DISCORD_TOKEN); (async () => { try { console.log('Suppression des anciennes commandes...'); await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] }); console.log('✅ Commandes supprimées'); console.log(''); console.log('Enregistrement de ' + commands.length + ' nouvelles commandes...'); const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }); console.log('✅ ' + data.length + ' commandes enregistrées avec succès!'); console.log(''); console.log('Commandes disponibles:'); data.forEach(cmd => console.log('  - /' + cmd.name)); } catch (error) { console.error('❌ Erreur:', error); } })();"

echo.
echo ========================================
echo   Termine! Relance le bot maintenant.
echo ========================================
pause
