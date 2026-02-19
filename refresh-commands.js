require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🧹 Suppression des commandes GLOBALES...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || '1112345678901234567'), // Fallback ID if missing
            { body: [] }
        );
        console.log('✅ Commandes globales supprimées.');

        console.log('🧹 Suppression des commandes de GUILDE...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID || '1112345678901234567', process.env.GUILD_ID),
            { body: [] }
        );
        console.log('✅ Commandes de guilde supprimées.');

        // Re-enregistrement propre (Guild uniquement pour être instantané)
        const commands = [];
        const commandsPath = path.join(__dirname, 'src', 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./src/commands/${file}`);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        console.log(`📋 Ré-enregistrement de ${commands.length} commandes pour la guilde...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID || '1112345678901234567', process.env.GUILD_ID),
            { body: commands }
        );
        console.log('🚀 Commandes ré-enregistrées avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
})();
