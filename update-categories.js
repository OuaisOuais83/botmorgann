const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🚀 Script de stylisation lancé pour ${client.user.tag}`);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        console.error('❌ Serveur non trouvé !');
        process.exit(1);
    }

    const categories = config.channels.categories;

    for (const [key, newName] of Object.entries(categories)) {
        // Mapping simple pour trouver l'ancienne catégorie si nécessaire, 
        // ou simplement chercher par mots clés
        const searchTerms = {
            welcome: 'BIENVENUE',
            growth: 'CROISSANCE',
            training: 'FARMING',
            production: 'PRODUCTION',
            money: 'RÉMUNÉRATION',
            elite: 'ELITE',
            management: 'MANAGEMENT'
        };

        const category = guild.channels.cache.find(ch =>
            ch.type === 4 && ch.name.toUpperCase().includes(searchTerms[key])
        );

        if (category) {
            console.log(`📝 Mise à jour de ${category.name} -> ${newName}`);
            await category.setName(newName);
        } else {
            console.log(`⚠️ Catégorie ${key} (${searchTerms[key]}) non trouvée`);
        }
    }

    console.log('✅ Stylisation terminée !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
