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

    // Trouver le canal accueil
    const accueilChannel = guild.channels.cache.find(ch => ch.name.includes('accueil'));

    if (!accueilChannel) {
        console.error('❌ Canal accueil non trouvé');
        process.exit(1);
    }

    console.log('📢 Envoi des annonces de lancement...\n');

    // ============================================
    // MESSAGE 1 : RAPPEL /APPLY
    // ============================================
    const applyEmbed = new EmbedBuilder()
        .setColor(0xFF5733)
        .setTitle('🚨 PLACES LIMITÉES - RECRUTEMENT EN COURS')
        .setDescription(
            '**Nouveaux arrivants, bienvenue ! 👋**\n\n' +
            '## 📝 POSTULER DÈS MAINTENANT\n\n' +
            'Pour rejoindre l\'équipe Farmer League, tape dans le serveur :\n' +
            '```\n/apply\n```\n\n' +
            '## ⏱️ TRAITEMENT RAPIDE\n' +
            '• ✅ **Réponse sous 24h maximum**\n' +
            '• 🎯 **Places limitées** pour garantir la qualité\n' +
            '• 🚀 **Lancement officiel mardi 10/02**\n\n' +
            '**Ne rate pas cette opportunité ! Les places partent vite. 🔥**'
        )
        .setFooter({ text: 'Farmer League • Candidatures ouvertes' })
        .setTimestamp();

    await accueilChannel.send({ embeds: [applyEmbed] });
    console.log('✅ Message 1 envoyé : Rappel /apply\n');

    // Petit délai entre les deux messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================
    // MESSAGE 2 : RÉUNION DE LANCEMENT
    // ============================================
    const meetingEmbed = new EmbedBuilder()
        .setColor(0x00D9FF)
        .setTitle('📅 RÉUNION DE LANCEMENT OFFICIEL')
        .setDescription(
            '**POUR TOUS LES MEMBRES SÉLECTIONNÉS**\n\n' +
            '## 🎯 INFORMATIONS\n\n' +
            '**Date :** Mardi 10 février 2026\n' +
            '**Heure :** 19h00 (heure de Paris)\n' +
            '**Où :** Canal vocal 📞 Réunion (voir événement Discord)\n\n' +
            '## 📋 AU PROGRAMME\n\n' +
            '**Présentation du système complet et lancement des premières missions.**\n' +
            '**Distribution des liens Tap.it personnalisés et explication du tracking.**\n\n' +
            '## ⚠️ ABSENTS ?\n\n' +
            'Si tu ne peux pas être présent le jour J :\n' +
            '• 📩 **Préviens un admin en MP**\n' +
            '• 📄 **Le debrief complet sera disponible en MP**\n\n' +
            '**On compte sur toi ! Let\'s farm ! 🌾**'
        )
        .setFooter({ text: 'Farmer League • Lancement Officiel' })
        .setTimestamp();

    await accueilChannel.send({ embeds: [meetingEmbed] });
    console.log('✅ Message 2 envoyé : Réunion de lancement\n');

    console.log('✨ Toutes les annonces ont été envoyées avec succès !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
