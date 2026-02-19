const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channel = guild.channels.cache.find(ch => ch.name.includes('accueil'));

    if (channel) {
        console.log(`🔍 Recherche de messages dans #${channel.name}...`);
        const messages = await channel.messages.fetch({ limit: 20 });
        const myMessages = messages.filter(m => m.author.id === client.user.id);

        for (const msg of myMessages.values()) {
            console.log(`🗑️ Suppression du message ID: ${msg.id}`);
            await msg.delete();
        }
    }

    console.log('✅ Nettoyage terminé !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
