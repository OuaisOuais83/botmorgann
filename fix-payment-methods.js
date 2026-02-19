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

    // Trouver le canal comment-être-payé
    const paymentChannel = guild.channels.cache.find(ch => ch.name.includes('comment-être-payé'));

    if (!paymentChannel) {
        console.error('❌ Canal comment-être-payé non trouvé');
        process.exit(1);
    }

    console.log('⏳ Mise à jour du canal #comment-être-payé...\n');

    // Supprimer les anciens messages
    const messages = await paymentChannel.messages.fetch({ limit: 100 });
    await paymentChannel.bulkDelete(messages, true);

    // Nouveau contenu avec PayPal et Crypto uniquement
    const paymentEmbed = new EmbedBuilder()
        .setColor(0xFFD740)
        .setTitle('💰 COMMENT ÊTRE PAYÉ ?')
        .setDescription(
            '## 💸 MODÈLE DE RÉMUNÉRATION\n\n' +
            '**Client actuel : 200€ pour 1000 clics**\n\n' +
            'Tu reçois un **lien d\'affiliation unique** :\n' +
            '✅ Trackage en temps réel\n' +
            '✅ Statistiques détaillées\n' +
            '✅ Calcul automatique de ta rémunération\n\n' +
            '## 🎬 DÉCLARER TES COMPTES\n\n' +
            '**IMPORTANT** : Tu DOIS déclarer tous tes comptes sociaux avec `/declare-accounts`\n\n' +
            'Pourquoi ?\n' +
            '• Attribution correcte des clics\n' +
            '• Prévention de la fraude\n' +
            '• Optimisation du tracking\n\n' +
            '**Commandes utiles :**\n' +
            '`/declare-accounts` → Ajouter un compte\n' +
            '`/my-accounts` → Voir tes comptes déclarés\n' +
            '`/remove-account` → Supprimer un compte\n' +
            '`/my-stats-affiliation` → Voir tes stats et gains\n\n' +
            '## 💵 PAIEMENTS\n\n' +
            '**Seuil minimum :** 50€ (~250 clics)\n' +
            '**Fréquence :** Mensuel (le 5 du mois)\n' +
            '**Méthodes :** \n' +
            '• 💳 **PayPal**\n' +
            '• 🪙 **Crypto** (Bitcoin, USDT, etc.)\n\n' +
            '## ❓ FAQ\n\n' +
            '**Q : Combien je peux gagner ?**\n' +
            'R : Dépend de tes clics. 1000 clics = 200€. Pas de limite !\n\n' +
            '**Q : Comment avoir plus de clics ?**\n' +
            'R : Crée du contenu viral avec ton lien en bio/description\n\n' +
            '**Q : Les clics sont vérifiés ?**\n' +
            'R : Oui, le système détecte les clics frauduleux\n\n' +
            '**Let\'s make money ! 💰**'
        )
        .setFooter({ text: 'Tape /my-stats-affiliation pour voir tes gains' });

    await paymentChannel.send({ embeds: [paymentEmbed] });

    console.log('✅ Canal mis à jour avec PayPal et Crypto uniquement !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
