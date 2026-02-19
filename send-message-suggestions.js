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

    // Trouver le canal admin
    const adminChannel = guild.channels.cache.find(ch => ch.name.includes('admin'));

    if (!adminChannel) {
        console.error('❌ Canal admin non trouvé');
        process.exit(1);
    }

    console.log('📢 Envoi des suggestions dans #admin...\n');

    // Message d'introduction
    await adminChannel.send('**📋 SUGGESTIONS MESSAGES DE LANCEMENT - À VALIDER**\n\nVoici 2 suggestions de messages. Copie-colle le contenu où tu veux !\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // SUGGESTION 1 : RAPPEL /APPLY
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

    await adminChannel.send({
        content: '**📌 SUGGESTION 1 - RAPPEL /APPLY**',
        embeds: [applyEmbed]
    });
    console.log('✅ Suggestion 1 envoyée\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================
    // SUGGESTION 2 : RÉUNION DE LANCEMENT
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

    await adminChannel.send({
        content: '**📌 SUGGESTION 2 - RÉUNION DE LANCEMENT**',
        embeds: [meetingEmbed]
    });
    console.log('✅ Suggestion 2 envoyée\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Instructions finales
    await adminChannel.send(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**💡 INSTRUCTIONS**\n\n' +
        '1. Clique sur les embeds ci-dessus\n' +
        '2. Copie le contenu (ou modifie-le si besoin)\n' +
        '3. Colle dans le canal de ton choix (#accueil recommandé)\n\n' +
        '**Note :** Ces messages restent ici pour référence. Tu peux les copier quand tu veux ! 📋'
    );

    console.log('✨ Toutes les suggestions ont été envoyées dans #admin !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
