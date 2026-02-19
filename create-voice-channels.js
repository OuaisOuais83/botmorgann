require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    // Trouver la catégorie MANAGEMENT
    const managementCategory = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name.includes('MANAGEMENT')
    );

    if (!managementCategory) {
        console.error('❌ Catégorie "MANAGEMENT" non trouvée');
        process.exit(1);
    }

    console.log(`✅ Catégorie trouvée : ${managementCategory.name}`);

    // Créer les salons vocaux
    const voiceChannels = [
        { name: '🎙️ Bureau Admin', parent: managementCategory.id },
        { name: '📞 Réunion', parent: managementCategory.id },
        { name: '🗣️ Salon Communautaire', parent: managementCategory.id }
    ];

    for (const channelData of voiceChannels) {
        // Vérifier si le canal existe déjà
        const existing = guild.channels.cache.find(ch =>
            ch.name === channelData.name && ch.type === ChannelType.GuildVoice
        );

        if (existing) {
            console.log(`ℹ️  Canal déjà existant : ${channelData.name}`);
            continue;
        }

        console.log(`⏳ Création de ${channelData.name}...`);
        await guild.channels.create({
            name: channelData.name,
            type: ChannelType.GuildVoice,
            parent: channelData.parent
        });
        console.log(`✅ ${channelData.name} créé`);
    }

    console.log('\n✨ Tous les salons vocaux ont été créés !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
