require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let output = '';
    guild.channels.cache.forEach(c => {
        output += `${c.name} (${c.type}) - Parent: ${c.parent ? c.parent.name : 'None'}\n`;
    });
    fs.writeFileSync('channels_debug.txt', output);
    console.log('Channels list saved to channels_debug.txt');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
