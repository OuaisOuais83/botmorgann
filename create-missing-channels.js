require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté pour création de canaux: ${client.user.tag}`);

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Serveur introuvable !');
            process.exit(1);
        }

        // Trouver ou créer la catégorie MANAGEMENT
        let managementCat = guild.channels.cache.find(ch =>
            ch.name === config.channels.categories.management &&
            ch.type === ChannelType.GuildCategory
        );

        if (!managementCat) {
            console.log('🏗️ Création de la catégorie MANAGEMENT...');
            managementCat = await guild.channels.create({
                name: config.channels.categories.management,
                type: ChannelType.GuildCategory
            });
        }

        const adminRole = guild.roles.cache.find(r => r.name === config.roles.admin.name);
        const modRole = guild.roles.cache.find(r => r.name === config.roles.moderator.name);

        const overwrites = [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel] },
            { id: modRole.id, allow: [PermissionFlagsBits.ViewChannel] }
        ];

        // Créer les canaux manquants
        const channelsToCreate = [
            '🆘・problèmes-support',
            '📱・tracking-comptes'
        ];

        for (const name of channelsToCreate) {
            const existing = guild.channels.cache.find(c => c.name === name);
            if (!existing) {
                console.log(`🏗️ Création du canal ${name}...`);
                await guild.channels.create({
                    name: name,
                    type: ChannelType.GuildText,
                    parent: managementCat.id,
                    permissionOverwrites: overwrites
                });
                console.log(`✅ Canal ${name} créé.`);
            } else {
                console.log(`ℹ️ Le canal ${name} existe déjà.`);
            }
        }

        console.log('🚀 Opération terminée avec succès !');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
