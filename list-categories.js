const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        console.error('❌ Serveur non trouvé !');
        process.exit(1);
    }

    console.log('--- LISTE DES CATÉGORIES ---');
    const categories = guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory);
    categories.forEach(cat => {
        console.log(`ID: ${cat.id} | Nom: "${cat.name}"`);
    });
    console.log('---------------------------');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
