
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const ADMIN_CHANNEL_ID = '1470156861641588839'; // 📋・admin

client.once('ready', async () => {
    try {
        const channel = await client.channels.fetch(ADMIN_CHANNEL_ID);
        if (channel) {
            await channel.send(
                '📢 **RAPPEL RÉUNION**\n\n' +
                'La réunion commence dans **5 minutes** ! ⏳\n' +
                'Vous pouvez déjà vous connecter.\n\n' +
                '👉 <#1470838733413548032>' // Lien vers le salon vocal Réunion
            );
            console.log('✅ Rappel envoyé dans #admin');
        } else {
            console.error('❌ Canal admin introuvable');
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        client.destroy();
    }
});

client.login(process.env.DISCORD_TOKEN);
