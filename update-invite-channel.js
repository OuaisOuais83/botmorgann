require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    // Trouver le canal invite-des-monteurs
    const inviteChannel = guild.channels.cache.find(ch => ch.name.includes('invite-des-monteurs'));

    if (!inviteChannel) {
        console.error('❌ Canal invite-des-monteurs non trouvé');
        process.exit(1);
    }

    console.log('⏳ Mise à jour du canal #invite-des-monteurs...\n');

    // Supprimer les anciens messages
    const messages = await inviteChannel.messages.fetch({ limit: 100 });
    await inviteChannel.bulkDelete(messages, true);

    // Nouveau contenu avec le système de lien
    const inviteEmbed = new EmbedBuilder()
        .setColor(0x00D9FF)
        .setTitle('🤝 INVITE DES MONTEURS ET GAGNE DES POINTS')
        .setDescription(
            '## 🔗 TON LIEN UNIQUE\n\n' +
            'Tape `/mon-lien-parrainage` pour obtenir ton lien personnel\n\n' +
            '## 💰 RÉCOMPENSES AUTOMATIQUES\n\n' +
            '**Pour toi (parrain) :**\n' +
            '• ✅ **+50 points** quand ton filleul est validé (/apply)\n' +
            '• 🎯 **+100 points** à sa première mission complétée\n' +
            '• 🏆 **Badge "Recruteur"** si ≥ 5 filleuls actifs\n\n' +
            '**Pour ton filleul :**\n' +
            '• 🎁 **+20 points** bonus de bienvenue\n\n' +
            '## 📝 COMMENT ÇA MARCHE ?\n\n' +
            '1. Récupère ton lien avec `/mon-lien-parrainage`\n' +
            '2. Partage-le à tes potes monteurs\n' +
            '3. Quand ils rejoignent via ton lien, **c\'est automatique** !\n' +
            '4. Tu gagnes des points dès qu\'ils sont validés\n\n' +
            '## 🏆 LEADERBOARD\n\n' +
            'Les meilleurs parrains gagnent des récompenses exclusives :\n' +
            '• 🥇 **Top 1** : Mission premium garantie\n' +
            '• 🥈 **Top 2-3** : Accès anticipé aux nouvelles missions\n' +
            '• 🥉 **Top 4-10** : Badge spécial visible\n\n' +
            '## ❓ RÈGLES\n\n' +
            '✅ Le filleul doit être actif minimum 7 jours\n' +
            '✅ Les points sont crédités **automatiquement**\n' +
            '✅ Pas besoin de commande, tout est trackél\n' +
            '❌ Fraude = bannissement immédiat\n\n' +
            '**Let\'s grow together ! 🌾**'
        )
        .setFooter({ text: 'Le tracking est 100% automatique !' });

    await inviteChannel.send({ embeds: [inviteEmbed] });

    console.log('✅ Canal mis à jour avec le système de parrainage automatique !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
