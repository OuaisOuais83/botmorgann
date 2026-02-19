const { Client, GatewayIntentBits } = require('discord.js');
const db = require('../src/database/db');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log('🔗 Connecté en tant que ' + client.user.tag);

    // 1. Initialiser la DB (Télécharger depuis Discord)
    await db.initDatabase(client);

    // 2. Récupérer tous les utilisateurs
    const users = await db.getAllUsers();
    console.log(`🔍 Analyse de ${users.length} utilisateurs...`);

    let totalDeleted = 0;

    for (const user of users) {
        const accounts = await db.getSocialAccounts(user.user_id);
        if (accounts && accounts.length > 0) {
            console.log(`🗑️ Suppression de ${accounts.length} comptes pour ${user.username}...`);

            // Copie du tableau pour éviter les problèmes d'index pendant la boucle
            const accountsBackup = [...accounts];

            for (const acc of accountsBackup) {
                await db.removeSocialAccount(user.user_id, acc.platform, acc.handle);
                totalDeleted++;
            }
        }
    }

    console.log(`✅ Nettoyage terminé ! Total comptes supprimés : ${totalDeleted}`);
    console.log('⏳ Attente de la sauvegarde automatique sur Discord (15s)...');

    setTimeout(() => {
        console.log('👋 Fin du script.');
        process.exit(0);
    }, 15000);
});

client.login(process.env.DISCORD_TOKEN);
