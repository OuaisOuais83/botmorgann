
require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    try {
        console.log('🚀 Listing categories...');
        const guild = client.guilds.cache.get(process.env.GUILD_ID) || await client.guilds.fetch().then(g => g.first().fetch());

        console.log(`Serveur: ${guild.name}`);

        const channels = await guild.channels.fetch();
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory);

        console.log('\n--- CATEGORIES ---');
        categories.forEach(c => {
            console.log(`[${c.id}] "${c.name}"`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        client.destroy();
    }
});

client.login(process.env.DISCORD_TOKEN);
