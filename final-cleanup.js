require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté pour le nettoyage: ${client.user.tag}`);

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Serveur introuvable !');
            process.exit(1);
        }

        // 1. SUPPRESSION DES CANAUX NON DÉSIRÉS
        const toDelete = [
            '🤝・entraide-farming',
            '📚・ressources-clips',
            '📈・dashboard-farming',
            '🤝・entraide-monteurs', // Ancien nom possible
            '📚・ressources-montage', // Ancien nom possible
            '📈・tableau-de-bord'     // Ancien nom possible
        ];

        for (const name of toDelete) {
            const channel = guild.channels.cache.find(ch => ch.name === name);
            if (channel) {
                console.log(`🗑️ Suppression du canal "${name}"...`);
                await channel.delete();
            }
        }

        // 2. REGROUPEMENT ADMIN & MANAGEMENT
        // On cherche l'ancienne catégorie MANAGEMENT
        let mgmtCat = guild.channels.cache.find(ch =>
            (ch.name.includes('MANAGEMENT')) &&
            ch.type === ChannelType.GuildCategory
        );

        if (mgmtCat) {
            const newName = config.channels.categories.management; // '🏢 ADMIN & MANAGEMENT'
            console.log(`🏗️ Renommage de la catégorie en "${newName}"...`);
            await mgmtCat.setName(newName);
        }

        console.log('🚀 Nettoyage et regroupement terminés !');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
