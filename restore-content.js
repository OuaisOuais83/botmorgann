require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const channelMessages = require('./src/utils/farmerLeagueMessages');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`🤖 Bot de restauration prêt : ${client.user.tag}`);
    
    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);
    
    if (!guild) {
        console.error('❌ Serveur non trouvé. Vérifiez GUILD_ID dans .env');
        process.exit(1);
    }

    console.log(`📡 Restauration du contenu pour le serveur : ${guild.name}`);

    for (const [channelName, sendFunction] of Object.entries(channelMessages)) {
        // Trouver le canal par son nom (en ignorant les emojis de préfixe si possible)
        const channel = guild.channels.cache.find(ch => 
            ch.isTextBased() && (ch.name.includes(channelName) || channelName.includes(ch.name.replace(/[^a-zA-Z-]/g, '')))
        );

        if (channel) {
            console.log(`⏳ Remplissage de #${channel.name}...`);
            try {
                await sendFunction(channel);
                console.log(`✅ #${channel.name} restauré.`);
            } catch (err) {
                console.error(`❌ Erreur sur #${channel.name}:`, err.message);
            }
        } else {
            console.log(`⚠️ Canal non trouvé pour : ${channelName}`);
        }
    }

    console.log('\n✨ Restauration terminée !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
