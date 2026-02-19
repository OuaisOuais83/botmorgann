require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./src/database/db');
const embeds = require('./src/utils/embeds');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

// ============================================
// CANDIDATS À APPROUVER MANUELLEMENT
// ============================================
const CANDIDATS_A_APPROUVER = [
    { username: "nono_11123", userId: null },
    { username: "babaaa", userId: null },
];

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('🔄 Approbation manuelle des candidats perdus...\n');

    const rookieRole = guild.roles.cache.find(r => r.name === '🥉 Rookie');
    const candidatRole = guild.roles.cache.find(r => r.name === '📋 Candidat');

    if (!rookieRole) {
        console.error('❌ Rôle Rookie non trouvé');
        process.exit(1);
    }

    for (const candidat of CANDIDATS_A_APPROUVER) {
        try {
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📋 Traitement de : ${candidat.username}`);

            // Chercher le membre sur le serveur
            let member = null;

            if (candidat.userId) {
                // Si on a l'ID, c'est facile
                member = await guild.members.fetch(candidat.userId);
            } else {
                // Sinon, chercher par nom
                const members = await guild.members.fetch();
                member = members.find(m =>
                    m.user.tag === candidat.username ||
                    m.user.username === candidat.username ||
                    m.user.globalName === candidat.username
                );
            }

            if (!member) {
                console.log(`⚠️ Membre "${candidat.username}" non trouvé sur le serveur. Ignoré.`);
                continue;
            }

            const userId = member.user.id;
            const username = member.user.username;

            console.log(`✅ Membre trouvé : ${member.user.tag} (${userId})`);

            // Créer l'utilisateur dans la DB directement
            const database = db.getDatabase();

            // Vérifier s'il existe déjà
            const existingUser = database.data.users.find(u => u.user_id === userId);

            if (existingUser) {
                console.log(`⚠️ Utilisateur déjà dans la DB. Mise à jour...`);
                existingUser.role = 'rookie';
            } else {
                console.log(`➕ Création du profil utilisateur...`);
                db.createUser(userId, username, 'rookie');
            }

            // Attribuer le rôle Rookie
            await member.roles.add(rookieRole);
            console.log(`✅ Rôle Rookie attribué`);

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

            // Créer un log d'audit
            db.createAuditLog(
                'MANUAL_APPROVAL',
                'SYSTEM',
                'Approbation manuelle',
                userId,
                username,
                `Candidature perdue approuvée manuellement`
            );

            console.log(`✅ ${username} approuvé avec succès !`);

        } catch (error) {
            console.error(`❌ Erreur avec ${candidat.username}:`, error.message);
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n✨ Approbation manuelle terminée !`);
    console.log(`\n💡 Vérifie que les membres ont bien reçu leur rôle Rookie`);
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
