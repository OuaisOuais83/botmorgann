require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
        console.log(`Canaux de ${guild.name}:`);
        guild.channels.cache.filter(ch => ch.isTextBased()).forEach(ch => {
            console.log(`- ${ch.name} (ID: ${ch.id})`);
        });
    }
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
