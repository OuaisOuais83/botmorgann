const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mes-parrainages')
        .setDescription('Affiche tes statistiques de parrainage'),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const userId = interaction.user.id;
            const username = interaction.user.username;

            // Vérifier si l'utilisateur existe
            let user = await db.getUser(userId);
            if (!user) {
                await interaction.editReply({
                    content:
                        `❌ Tu n'as pas encore de profil.\n\n` +
                        `Utilise d'abord \`/apply\` pour postuler !`
                });
                return;
            }

            // Récupérer les parrainages
            const referrals = db.getReferralsByUser(userId);

            // Filtrer par statut
            const activeReferrals = referrals.filter(r => r.status === 'active');
            const validatedReferrals = referrals.filter(r => r.status === 'validated');
            const pendingReferrals = referrals.filter(r => r.status === 'pending');

            // Calculer les points totaux gagnés via parrainage
            const totalReferralPoints = referrals.reduce((sum, r) => sum + (r.points_earned || 0), 0);

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`👥 PARRAINAGES DE ${username.toUpperCase()}`)
                .setDescription(
                    `**Points de parrainage : ${user.referral_points || 0} pts** 💰\n` +
                    `**Filleuls actifs : ${activeReferrals.length}** 🚀\n\n` +
                    `────────────────────────`
                )
                .setTimestamp();

            // Si aucun parrainage
            if (referrals.length === 0) {
                embed.addFields({
                    name: '📊 Statistiques',
                    value:
                        `Aucun filleul pour l'instant.\n\n` +
                        `**Utilise \`/mon-lien-parrainage\` pour commencer à parrainer !**\n\n` +
                        `Tu gagnes **50 pts** par filleul validé + **100 pts** à sa première mission.`,
                    inline: false
                });

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Afficher les filleuls actifs
            if (activeReferrals.length > 0) {
                const activePromises = activeReferrals.slice(0, 5).map(async (r) => {
                    const referredUser = await db.getUser(r.referred_id);
                    const points = referredUser ? referredUser.points : 0;
                    return `**${r.referred_username}** - ${points} pts (${r.points_earned || 0} pts gagnés)`;
                });
                const activeList = (await Promise.all(activePromises)).join('\n');

                embed.addFields({
                    name: `🚀 Filleuls Actifs (${activeReferrals.length})`,
                    value: activeList + (activeReferrals.length > 5 ? `\n... et ${activeReferrals.length - 5} autres` : ''),
                    inline: false
                });
            }

            // Afficher les filleuls validés (pas encore actifs)
            if (validatedReferrals.length > 0) {
                const validatedList = validatedReferrals.slice(0, 3).map(r => {
                    return `**${r.referred_username}** - En attente de première mission`;
                }).join('\n');

                embed.addFields({
                    name: `✅ Filleuls Validés (${validatedReferrals.length})`,
                    value: validatedList + (validatedReferrals.length > 3 ? `\n... et ${validatedReferrals.length - 3} autres` : ''),
                    inline: false
                });
            }

            // Afficher les filleuls en attente
            if (pendingReferrals.length > 0) {
                const pendingList = pendingReferrals.slice(0, 3).map(r => {
                    return `**${r.referred_username}** - En attente de validation`;
                }).join('\n');

                embed.addFields({
                    name: `⏳ En Attente de Validation (${pendingReferrals.length})`,
                    value: pendingList + (pendingReferrals.length > 3 ? `\n... et ${pendingReferrals.length - 3} autres` : ''),
                    inline: false
                });
            }

            // Ajouter le résumé des gains
            embed.addFields({
                name: '💰 Résumé des Gains',
                value:
                    `**Total gagné via parrainages :** ${totalReferralPoints} pts\n` +
                    `**Prochain objectif :** ${activeReferrals.length < 3 ? '3 filleuls actifs (Badge Recruteur Bronze)' : activeReferrals.length < 5 ? '5 filleuls actifs (Badge Recruteur Argent)' : '10 filleuls actifs (Badge Recruteur Or)'}`,
                inline: false
            });

            // Footer avec astuce
            embed.setFooter({
                text: 'Astuce : Plus tes filleuls progressent, plus tu gagnes de points !'
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur /mes-parrainages:', error);
            await interaction.editReply({
                content: '❌ Erreur lors de l\'affichage des parrainages'
            });
        }
    }
};
