require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('❌ Aucun serveur trouvé !');
        process.exit(1);
    }

    console.log(`📊 Serveur: ${guild.name}`);

    try {
        // Trouver le rôle Rookie
        const rookieRole = guild.roles.cache.find(r => r.name.includes('Rookie') || r.name.includes('🥉'));

        if (!rookieRole) {
            console.error('❌ Rôle Rookie non trouvé !');
            process.exit(1);
        }

        console.log(`✅ Rôle trouvé: ${rookieRole.name} (${rookieRole.members.size} membres)`);

        // Trouver le canal admin ou annonces
        const adminChannel = guild.channels.cache.find(ch =>
            (ch.name.includes('admin') || ch.name.includes('annonces')) && ch.isTextBased()
        );

        if (!adminChannel) {
            console.error('❌ Canal admin/annonces non trouvé !');
            process.exit(1);
        }

        console.log(`✅ Canal trouvé: ${adminChannel.name}`);

        // Créer le message
        const message = await adminChannel.send({
            content: `${rookieRole}`,
            embeds: [{
                color: 0x00FF00,
                title: '🎉 CANDIDATURE RETENUE',
                description:
                    `**Félicitations !**\n\n` +
                    `Si tu reçois ce message, c'est que **ta candidature a été retenue** pour rejoindre Farmer League ! 🌾\n\n` +
                    `────────────────────────\n\n` +
                    `**📅 PROCHAINE ÉTAPE : RÉUNION DE LANCEMENT**\n\n` +
                    `Une réunion est prévue prochainement pour :\n` +
                    `• Te présenter le système en détail\n` +
                    `• Répondre à tes questions\n` +
                    `• T'attribuer ton lien de tracking\n\n` +
                    `────────────────────────\n\n` +
                    `**✅ SI TU SERAS PRÉSENT :**\n` +
                    `Réagis à ce message avec ✅\n\n` +
                    `**❌ SI TU SERAS ABSENT :**\n` +
                    `Envoie un DM à un admin pour obtenir le compte rendu de la réunion\n\n` +
                    `────────────────────────\n\n` +
                    `**Bienvenue dans la League ! 🚀**`,
                timestamp: new Date(),
                footer: {
                    text: 'Farmer League'
                }
            }]
        });

        // Ajouter les réactions
        await message.react('✅');
        await message.react('❌');

        console.log('✅ Message envoyé avec succès !');
        console.log(`📝 ID du message: ${message.id}`);
        console.log(`🔗 Lien: ${message.url}`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
