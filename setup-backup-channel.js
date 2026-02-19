require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);
    const guild = client.guilds.cache.first();

    try {
        // 1. Chercher ou créer la catégorie ADMIN
        let category = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildCategory &&
            (c.name.toUpperCase().includes('ADMIN') || c.name.includes('Administration'))
        );

        if (!category) {
            console.log('⚠️ Catégorie ADMIN non trouvée, création...');
            category = await guild.channels.create({
                name: '⛔ ADMINISTRATION',
                type: ChannelType.GuildCategory
            });
        }

        // 2. Créer le canal de sauvegarde
        const channelName = '💾・sauvegarde-données';
        let channel = guild.channels.cache.find(c => c.name === channelName);

        if (!channel) {
            channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel] // Invisible pour tous
                    },
                    {
                        id: guild.roles.cache.find(r => r.permissions.has(PermissionFlagsBits.Administrator))?.id || guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] // Visible admins
                    }
                ]
            });
            console.log(`✅ Canal de sécurité créé: ${channel.name} (ID: ${channel.id})`);
            await channel.send('🔒 **LOGS DE SÉCURITÉ**\nCe canal enregistre une copie brute de toutes les données sensibles (Candidatures, Comptes, Parrainages). Ne pas supprimer.');
        } else {
            console.log(`ℹ️ Le canal existe déjà: ${channel.name} (ID: ${channel.id})`);
        }

        // 3. Afficher l'ID pour le config
        console.log(`👉 ID À UTILISER DANS NOTIFICATIONS.JS: '${channel.id}'`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
