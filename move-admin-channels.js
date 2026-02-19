require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const adminMgmtName = '🏢 ADMIN & MANAGEMENT';
        const targetCategory = guild.channels.cache.find(c => c.name === adminMgmtName && c.type === ChannelType.GuildCategory);

        if (!targetCategory) {
            console.error(`❌ Catégorie ${adminMgmtName} introuvable !`);
            process.exit(1);
        }

        // Channels to move if they are not already in the category
        const channelsToMove = [
            'admin-général',
            'problèmes-support',
            'tracking-comptes',
            'stats-communauté',
            'acquisition-clients',
            'validation-projets'
        ];

        for (const channel of guild.channels.cache.values()) {
            if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice) {
                const isTarget = channelsToMove.some(name => channel.name.includes(name));
                if (isTarget && channel.parentId !== targetCategory.id) {
                    console.log(`📦 Déplacement de ${channel.name} vers ${adminMgmtName}...`);
                    await channel.setParent(targetCategory.id, { lockPermissions: true });
                }
            }
        }

        console.log('✅ Consolidation terminée.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
