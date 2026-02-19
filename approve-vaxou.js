require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const embeds = require('./src/utils/embeds');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('🔄 Approbation de vaxou_...\n');

    const rookieRole = guild.roles.cache.find(r => r.name === '🥉 Rookie');
    const candidatRole = guild.roles.cache.find(r => r.name === '📋 Candidat');

    if (!rookieRole) {
        console.error('❌ Rôle Rookie non trouvé');
        process.exit(1);
    }

    try {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📋 Traitement de : vaxou_`);

        // Chercher le membre par nom
        const members = await guild.members.fetch();
        const member = members.find(m =>
            m.user.tag.includes("vaxou") ||
            m.user.username.includes("vaxou") ||
            m.user.globalName?.includes("vaxou")
        );

        if (!member) {
            console.log(`⚠️ Membre "vaxou_" non trouvé sur le serveur.`);
            console.log(`\nListe des membres contenant "vax" :`);
            members.forEach(m => {
                if (m.user.username.toLowerCase().includes('vax')) {
                    console.log(`  - ${m.user.tag} (${m.user.username})`);
                }
            });
            process.exit(1);
        }

        console.log(`✅ Membre trouvé : ${member.user.tag} (${member.user.id})`);

        // Attribuer le rôle Rookie
        if (!member.roles.cache.has(rookieRole.id)) {
            await member.roles.add(rookieRole);
            console.log(`✅ Rôle Rookie attribué`);
        } else {
            console.log(`⚠️ A déjà le rôle Rookie`);
        }

        // Retirer le rôle Candidat si présent
        if (candidatRole && member.roles.cache.has(candidatRole.id)) {
            await member.roles.remove(candidatRole);
            console.log(`✅ Rôle Candidat retiré`);
        }

        // Envoyer le message de validation DM
        try {
            await member.user.send({
                embeds: [embeds.success(
                    '🎉 Candidature approuvée !',
                    `## Bienvenue dans Farmer League ! 🌾\n\n` +
                    `Ta candidature a été **approuvée** ! Tu es maintenant **Rookie**.\n\n` +
                    `**🔗 Prochaines étapes :**\n\n` +
                    `**1. 📅 RÉUNION DE LANCEMENT**\n` +
                    `• Mardi 10 février à 19h00\n` +
                    `• Canal vocal 📞 Réunion\n` +
                    `• Programme : présentation système + attribution liens Tap.it\n\n` +
                    `**2. 💰 Déclare tes comptes sociaux**\n` +
                    `• Utilise la commande \`/declare-accounts\` sur le serveur\n` +
                    `• Nécessaire pour recevoir ton lien de tracking\n\n` +
                    `**3. 🎯 Consulte les missions**\n` +
                    `• Va dans le canal #missions\n` +
                    `• Commence dès que tu veux !\n\n` +
                    `**⚠️ Si tu ne peux pas être là le 10/02, préviens un admin en MP.**\n\n` +
                    `**Let's farm together ! 🚀**`
                )]
            });
            console.log(`📩 Message de validation envoyé en DM`);
        } catch (err) {
            console.log(`⚠️ Impossible d'envoyer un DM (DMs fermés)`);
        }

        console.log(`✅ vaxou_ approuvé avec succès !`);

    } catch (error) {
        console.error(`❌ Erreur:`, error.message);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n✨ Approbation terminée !`);
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
