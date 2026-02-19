require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('❌ Aucun serveur trouvé !');
        process.exit(1);
    }

    console.log(`📊 Serveur: ${guild.name}`);

    try {
        // Chercher la catégorie "INFORMATIONS" ou "INFO"
        let category = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildCategory &&
            (c.name.toLowerCase().includes('information') || c.name.toLowerCase().includes('info'))
        );

        // Si pas trouvé, utiliser la première catégorie disponible ou null
        if (!category) {
            category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory);
            console.log(`⚠️ Catégorie INFORMATIONS non trouvée, utilisation de: ${category?.name || 'aucune catégorie'}`);
        }

        // Vérifier si le canal existe déjà
        const existingChannel = guild.channels.cache.find(c =>
            c.name.includes('annonces') && c.type === ChannelType.GuildText
        );

        if (existingChannel) {
            console.log(`✅ Canal d'annonces existe déjà: ${existingChannel.name}`);
            process.exit(0);
        }

        // Créer le canal d'annonces
        const announcementsChannel = await guild.channels.create({
            name: '📢・annonces',
            type: ChannelType.GuildText,
            parent: category?.id,
            topic: 'Annonces importantes de Farmer League - Mises à jour, événements, et infos importantes',
            position: 0, // En haut de la catégorie
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                },
                {
                    id: guild.roles.cache.find(r => r.permissions.has(PermissionFlagsBits.Administrator))?.id || guild.roles.everyone.id,
                    allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
                }
            ]
        });

        console.log(`✅ Canal créé: ${announcementsChannel.name} (ID: ${announcementsChannel.id})`);

        // Envoyer un premier message d'annonce
        await announcementsChannel.send({
            content:
                `# 📢 CANAL D'ANNONCES FARMER LEAGUE\n\n` +
                `Bienvenue dans le canal officiel des annonces !\n\n` +
                `**Ici tu trouveras :**\n` +
                `✅ Nouvelles missions disponibles\n` +
                `✅ Mises à jour du système de points\n` +
                `✅ Événements et réunions\n` +
                `✅ Changements importants\n\n` +
                `────────────────────────\n\n` +
                `**🎯 SYSTÈME DE PARRAINAGE ACTIF !**\n\n` +
                `Tape \`/mon-lien-parrainage\` pour obtenir ton lien personnel et inviter d'autres monteurs.\n\n` +
                `**Tu gagnes :**\n` +
                `• **+50 points** quand ton filleul est validé\n` +
                `• **+100 points** à sa première mission complétée\n\n` +
                `Let's grow together ! 🌾🚀`
        });

        console.log('✅ Message d\'annonce envoyé !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
