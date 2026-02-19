require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ID du canal #tracking-comptes
const CHANNEL_ID = '1470227353132204095';

client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!channel) {
            console.error(`❌ Canal introuvable (ID: ${CHANNEL_ID})`);
            process.exit(1);
        }

        console.log(`📡 Canal trouvé: ${channel.name} (${channel.type})`);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔔 Test de Notification Réel')
            .setDescription('Ceci est un test pour vérifier que vous recevez bien les alertes.')
            .addFields(
                { name: 'Statut', value: 'Opérationnel', inline: true },
                { name: 'Heure', value: new Date().toLocaleTimeString('fr-FR'), inline: true }
            )
            .setFooter({ text: 'Farmer League Bot System' });

        await channel.send({
            content: '🚨 **TEST NOTIFICATION ADMIN** <@' + process.env.ADMIN_ID + '>',
            embeds: [embed]
        });

        console.log('✅ Message envoyé avec succès !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    // Attendre un peu avant de couper pour être sûr que ça part
    setTimeout(() => {
        client.destroy();
        process.exit(0);
    }, 2000);
});

client.login(process.env.DISCORD_TOKEN);
