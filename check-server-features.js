const { Client, GatewayIntentBits } = require('discord.js');
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

    console.log('--- DIAGNOSTIC SERVEUR ---');
    console.log(`Nom: ${guild.name}`);
    console.log(`Boost Level: ${guild.premiumTier}`);
    console.log(`Features: ${guild.features.join(', ')}`);
    console.log(`Banner Supporté: ${guild.features.includes('BANNER')}`);
    console.log('---------------------------');

    // Check if the bot can manage the guild (to set banner)
    const botMember = await guild.members.fetch(client.user.id);
    console.log(`Permissions Bot: ${botMember.permissions.has('ManageGuild') ? '✅ Gérer serveur' : '❌ Pas de gestion serveur'}`);

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
