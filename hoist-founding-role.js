
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    try {
        console.log('🚀 Démarrage du script de mise à jour des rôles...');

        // Récupérer la guilde (serveur)
        const guilds = await client.guilds.fetch();
        const guild = await guilds.first().fetch();
        console.log(`Serveur trouvé: ${guild.name}`);

        // Récupérer le rôle "Founding Member"
        const foundingRoleName = config.roles.founding.name; // "🌾 Founding Member"

        // Chercher le rôle dans le cache ou le fetcher
        const roles = await guild.roles.fetch();
        const foundRole = roles.find(r => r.name === foundingRoleName);

        if (foundRole) {
            console.log(`✅ Rôle trouvé: ${foundRole.name}`);

            if (foundRole.hoist) {
                console.log('ℹ️ Le rôle est déjà affiché séparément (hoisted).');
            } else {
                console.log('🔄 Mise à jour du rôle pour l\'afficher séparément...');
                await foundRole.setHoist(true);
                console.log('✅ Rôle mis à jour avec succès !');
            }
        } else {
            console.error(`❌ Rôle non trouvé: ${foundingRoleName}`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        console.log('👋 Fin du script');
        client.destroy();
    }
});

client.login(process.env.DISCORD_TOKEN);
