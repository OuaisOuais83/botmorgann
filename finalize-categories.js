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

    const updates = [
        { id: '1470156830318788695', name: '━━━ 🌱 COMMUNAUTÉ ━━━' },
        { id: '1470170331292368918', name: '━━━ 🎙️ VOCAL ━━━' }
    ];

    for (const update of updates) {
        const channel = await guild.channels.fetch(update.id);
        if (channel) {
            console.log(`📝 Mise à jour: ${channel.name} -> ${update.name}`);
            await channel.setName(update.name);
        }
    }

    console.log('✅ Finalisation de la stylisation terminée !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
