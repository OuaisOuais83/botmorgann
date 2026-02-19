require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Serveur introuvable !');
            process.exit(1);
        }

        const channels = await guild.channels.fetch();
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory).sort((a, b) => a.position - b.position);

        console.log(`\n📊 AUDIT DU SERVEUR : ${guild.name}\n`);

        for (const cat of categories.values()) {
            console.log(`📂 [CATEGORY] ${cat.name}`);
            const children = channels.filter(c => c.parentId === cat.id).sort((a, b) => a.position - b.position);
            for (const child of children.values()) {
                const typeIcon = child.type === ChannelType.GuildText ? '💬' : '🔊';
                console.log(`   ${typeIcon} ${child.name}`);
            }
        }

        const orphans = channels.filter(c => !c.parentId && c.type !== ChannelType.GuildCategory).sort((a, b) => a.position - b.position);
        if (orphans.size > 0) {
            console.log('\n📦 [NO CATEGORY]');
            for (const orphan of orphans.values()) {
                const typeIcon = orphan.type === ChannelType.GuildText ? '💬' : '🔊';
                console.log(`   ${typeIcon} ${orphan.name}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
