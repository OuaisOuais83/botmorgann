const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🧹 Nettoyage des commandes GLOBALES...');

        // Obtenir l'ID du bot (on peut le déduire du token ou le passer en env)
        // Pour simplifier, on va juste essayer de vider les commandes globales
        // Discord nécessite l'ID de l'application

        // On récupère d'abord l'ID de l'application via une requête simple si possible, 
        // ou on demande à l'utilisateur. Ici on va tenter de le trouver via whoami ou juste deviner si c'est possible.
        // En fait, on peut juste utiliser railway variables ou voir les logs passés.
        // Bot ID d'après les logs: 1457731497036480604
        const clientId = '1457731497036480604';

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log('✅ Commandes GLOBALES supprimées !');
        console.log('🚀 Les commandes de serveur (Guild) seront maintenant prioritaires et instantanées.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
})();
