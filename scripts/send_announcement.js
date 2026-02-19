const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const CHANNEL_NAME = 'rookie-discussion'; // Canal cible

client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Trouver le canal
    let channel = client.channels.cache.find(c => (c.name === CHANNEL_NAME || c.name.includes('rookie')) && c.isTextBased());

    if (!channel) {
        console.error(`❌ Impossible de trouver un canal nommé "${CHANNEL_NAME}".`);
        process.exit(1);
    }

    // Trouver le rôle Rookie pour le tag
    const role = channel.guild.roles.cache.find(r => r.name === 'Rookie');
    const roleTag = role ? `<@&${role.id}>` : '@Rookie';

    console.log(`📢 Envoi du message dans #${channel.name}...`);

    const embed = new EmbedBuilder()
        .setColor('#00FF00') // Vert Success
        .setTitle('📢 INFO IMPORTANTE : Mise à jour Comptes')
        .setDescription(`
**Le système de déclaration est réparé et sécurisé !** 🚀

Si vous avez eu des soucis (erreurs, doublons "8 comptes"), nous avons fait un nettoyage pour vous permettre de repartir proprement.
*(Pas de panique : Vos points et candidatures sont conservés !)*

**📝 MARCHE À SUIVRE :**
1. Faites \`/my-accounts\` pour vérifier.
2. Si vous n'avez rien, faites \`/declare-accounts\`.
3. **En cas d'erreur de saisie**, pas besoin de tout refaire : utilisez simplement \`/edit-account\` !

Une fois votre compte ajouté, vous recevrez votre lien **Tap.it** sous 24h.

Merci de votre patience la team ! On est reparti pour charbonner ! 💪
        `)
        .setFooter({ text: 'L\'équipe Farmer League', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    try {
        await channel.send({ content: `🚨 ${roleTag} 🚨`, embeds: [embed] });
        console.log('✅ Message envoyé avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi:', error);
    }

    setTimeout(() => process.exit(0), 1000);
});

client.login(process.env.DISCORD_TOKEN);
