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

        // Move 📋・admin
        const adminChannel = guild.channels.cache.find(c => c.name === '📋・admin');
        if (adminChannel) {
            console.log(`📦 Déplacement de ${adminChannel.name} vers ${adminMgmtName}...`);
            await adminChannel.setParent(targetCategory.id, { lockPermissions: true });

            // On le met en bas de la catégorie
            const categoryChannels = guild.channels.cache.filter(c => c.parentId === targetCategory.id).sort((a, b) => a.position - b.position);
            await adminChannel.setPosition(categoryChannels.size);
        }

        console.log('✅ Consolidation finale terminée.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
