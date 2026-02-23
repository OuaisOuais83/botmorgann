const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mon-lien-parrainage')
        .setDescription('Obtiens ton lien de parrainage personnel pour inviter des monteurs'),

    async execute(interaction) {
        console.log(`🔍 Commande /mon-lien-parrainage appelée par ${interaction.user.username}`);

        try {
            // Répondre immédiatement pour éviter le timeout
            await interaction.reply({
                content: '⏳ Génération de ton lien de parrainage...',
                ephemeral: true
            });

            const userId = interaction.user.id;
            const username = interaction.user.username;

            console.log(`📊 Vérification utilisateur: ${userId}`);

            // Vérifier si l'utilisateur existe dans la DB
            let user = await db.getUser(userId);
            if (!user) {
                console.log(`➕ Création nouvel utilisateur: ${username}`);
                user = await db.createUser(userId, username);
            }

            // Si l'utilisateur a déjà un lien de parrainage, le retourner
            if (user.referral_link) {
                console.log(`♻️ Lien existant trouvé: ${user.referral_link}`);
                const inviteUrl = `https://discord.gg/${user.referral_link}`;

                await interaction.editReply({
                    content:
                        `🔗 **TON LIEN DE PARRAINAGE**\n\n` +
                        `${inviteUrl}\n\n` +
                        `────────────────────────\n\n` +
                        `**💰 TU GAGNES :**\n` +
                        `✅ **+50 points** quand ton filleul est validé\n` +
                        `✅ **+100 points** quand il complète sa première mission\n\n` +
                        `**🎯 COMMENT ÇA MARCHE :**\n` +
                        `1️⃣ Partage ce lien à des monteurs talentueux\n` +
                        `2️⃣ Ils rejoignent via ton lien\n` +
                        `3️⃣ Ils postulent avec \`/apply\`\n` +
                        `4️⃣ S'ils sont validés → **TU GAGNES DES POINTS !**\n\n` +
                        `📊 Tape \`/mes-parrainages\` pour voir tes stats 🚀`
                });
                return;
            }

            console.log('🆕 Création d\'un nouveau lien d\'invitation...');

            // Créer une nouvelle invitation personnalisée
            const guild = interaction.guild;

            // Trouver le canal général ou le premier canal texte disponible
            const channel = guild.channels.cache.find(ch =>
                (ch.name.includes('accueil') || ch.name.includes('général') || ch.name.includes('general'))
                && ch.isTextBased()
            ) || guild.channels.cache.find(ch => ch.isTextBased());

            if (!channel) {
                console.log('⚠️ Aucun canal trouvé pour créer l\'invitation');
                await interaction.editReply({
                    content: '❌ Impossible de créer un lien d\'invitation (aucun canal disponible)'
                });
                return;
            }

            console.log(`📋 Tentative de création d'invitation sur le canal: ${channel.name}`);

            // Créer l'invitation (100 utilisations max, jamais expire)
            const invite = await channel.createInvite({
                maxAge: 0,        // Jamais expire
                maxUses: 100,     // 100 utilisations max
                unique: true,     // Créer un nouveau code unique
                reason: `Lien de parrainage pour ${username}`
            });

            console.log(`✅ Invitation créée: ${invite.code}`);

            // Stocker le code d'invitation dans la DB
            await db.updateUserReferralLink(userId, invite.code);
            console.log(`💾 Lien sauvegardé en base de données`);

            const inviteUrl = `https://discord.gg/${invite.code}`;

            await interaction.editReply({
                content:
                    `✅ **LIEN DE PARRAINAGE CRÉÉ !**\n\n` +
                    `${inviteUrl}\n\n` +
                    `────────────────────────\n\n` +
                    `**💰 TU GAGNES :**\n` +
                    `✅ **+50 points** quand ton filleul est validé\n` +
                    `✅ **+100 points** quand il complète sa première mission\n\n` +
                    `**🎯 COMMENT ÇA MARCHE :**\n` +
                    `1️⃣ Partage ce lien à des monteurs talentueux\n` +
                    `2️⃣ Ils rejoignent via ton lien\n` +
                    `3️⃣ Ils postulent avec \`/apply\`\n` +
                    `4️⃣ S'ils sont validés → **TU GAGNES DES POINTS !**\n\n` +
                    `📊 Tape \`/mes-parrainages\` pour voir tes stats 🚀`
            });

            console.log(`✅ Lien de parrainage créé pour ${username}: ${invite.code}`);

        } catch (error) {
            console.error('❌ Erreur /mon-lien-parrainage:', error);
            console.error('Stack trace:', error.stack);

            let errorMessage = '❌ Erreur lors de la création du lien de parrainage';

            // Messages d'erreur plus spécifiques
            if (error.code === 50013) {
                errorMessage = '❌ Le bot n\'a pas la permission de créer des invitations. Contacte un admin pour ajouter la permission "Créer une invitation".';
            } else if (error.message) {
                errorMessage += `\n\nDétails: ${error.message}`;
            }

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ content: errorMessage });
                } else {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            } catch (replyError) {
                console.error('❌ Impossible de répondre à l\'interaction:', replyError);
            }
        }
    }
};
