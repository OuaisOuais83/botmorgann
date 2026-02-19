require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log('--- START AGGRESSIVE MOVE ---');
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) throw new Error('Guild not found');

        const adminMgmtName = '🏢 ADMIN & MANAGEMENT';
        const targetCategory = guild.channels.cache.find(c =>
            c.name.includes('ADMIN') && c.name.includes('MANAGEMENT') && c.type === ChannelType.GuildCategory
        );

        if (!targetCategory) {
            console.error(`❌ Catégorie cible introuvable !`);
            process.exit(1);
        }
        console.log(`✅ Cible trouvée: ${targetCategory.name} (${targetCategory.id})`);

        // Find channel with "admin" in it and NO parent
        const adminChannels = guild.channels.cache.filter(c =>
            c.name.toLowerCase().includes('admin') &&
            c.type === ChannelType.GuildText &&
            c.parentId === null
        );

        console.log(`🔍 Trouvé ${adminChannels.size} canaux admin orphelins.`);

        for (const chan of adminChannels.values()) {
            console.log(`📦 Déplacement de "${chan.name}" (ID: ${chan.id})...`);
            await chan.setParent(targetCategory.id, { lockPermissions: true });
            console.log(`✅ Déplacement de "${chan.name}" réussi.`);
        }

        console.log('--- END AGGRESSIVE MOVE ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ CRASH:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
