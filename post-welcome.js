const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
require('dotenv').config();
const path = require('path');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const welcomeChannel = guild.channels.cache.find(ch => ch.name.includes('accueil'));

    if (welcomeChannel) {
        console.log(`📍 Envoi du message de bienvenue dans #${welcomeChannel.name}`);

        const bannerPath = path.join(__dirname, 'assets', 'welcome_banner.png');
        const logoPath = path.join(__dirname, 'assets', 'logo.png');

        const files = [];
        files.push(new AttachmentBuilder(bannerPath, { name: 'banner.png' }));
        files.push(new AttachmentBuilder(logoPath, { name: 'logo.png' }));

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🌾 BIENVENUE DANS LA FARMER LEAGUE')
            .setImage('attachment://banner.png')
            .setThumbnail('attachment://logo.png')
            .setDescription(
                '### **Propulsez votre talent, gérez votre succès.**\n\n' +
                'Farmer League est la structure d\'élite pour les monteurs qui veulent transformer leur passion en revenus réels.\n\n' +
                '🚀 **VOTRE PARCOURS :**\n' +
                '1️⃣ **Vision** : Découvrez notre ADN dans <#1457726362323390572>\n' +
                '2️⃣ **Action** : Participez aux défis dans <#1457726362323390574>\n' +
                '3️⃣ **Join** : Tapez `/apply` pour postuler\n\n' +
                '**Le farming n\'attend pas. Bienvenue dans la league.** 🫡'
            )
            .setFooter({ text: 'Farmer League - On grandit ensemble' })
            .setTimestamp();

        // Nettoyer les anciens messages si possible (optionnel)
        // await welcomeChannel.bulkDelete(5).catch(() => {});

        await welcomeChannel.send({
            embeds: [embed],
            files: files
        });

        console.log('✅ Message de bienvenue envoyé avec succès !');
    }

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
