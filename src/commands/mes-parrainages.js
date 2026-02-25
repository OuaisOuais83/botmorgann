const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mes-parrainages')
        .setDescription('👥 Voir qui tu as parrainé et combien d\'affiliés tu as'),

    async execute(interaction) {
        let deferred = false;
        try {
            await interaction.deferReply({ ephemeral: true });
            deferred = true;

            const userId = interaction.user.id;
            const username = interaction.user.username;

            // Vérifier si l'utilisateur existe
            let user = await db.getUser(userId);
            if (!user) {
                await interaction.editReply({
                    content:
                        `❌ Tu n'as pas encore de profil.\n\n` +
                        `Va dans #accueil et clique sur **Postuler** pour ouvrir une candidature !`
                });
                return;
            }

            // Récupérer les parrainages
            let referrals = await db.getReferralsByUser(userId);
            if (!Array.isArray(referrals)) referrals = [];

            // Filtrer par statut
            const activeReferrals = referrals.filter(r => r.status === 'active');
            const validatedReferrals = referrals.filter(r => r.status === 'validated');
            const pendingReferrals = referrals.filter(r => r.status === 'pending');

            // Calculer les points totaux gagnés via parrainage
            const totalReferralPoints = referrals.reduce((sum, r) => sum + (r.points_earned || 0), 0);

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`👥 Tes affiliés - ${username}`)
                .setDescription(
                    `**Total : ${referrals.length} affilié${referrals.length > 1 ? 's' : ''}**\n` +
                    `**Points gagnés : ${user.referral_points || 0} pts** 💰\n` +
                    `**Actifs (1ère mission faite) : ${activeReferrals.length}** 🚀\n\n` +
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
                    try {
                        const referredUser = await db.getUser(r.referred_id);
                        const points = referredUser ? referredUser.points : 0;
                        return `**${r.referred_username || 'Inconnu'}** - ${points} pts (${r.points_earned || 0} pts gagnés)`;
                    } catch (e) {
                        return `**${r.referred_username || 'Inconnu'}** - ? pts`;
                    }
                });
                const activeList = (await Promise.all(activePromises)).join('\n');
                const value = (activeList + (activeReferrals.length > 5 ? `\n... et ${activeReferrals.length - 5} autres` : '')).substring(0, 1024);

                embed.addFields({
                    name: `🚀 Filleuls Actifs (${activeReferrals.length})`,
                    value: value || '-',
                    inline: false
                });
            }

            // Afficher les filleuls validés (pas encore actifs)
            if (validatedReferrals.length > 0) {
                const validatedList = validatedReferrals.slice(0, 3).map(r => {
                    return `**${r.referred_username || 'Inconnu'}** - En attente de première mission`;
                }).join('\n');

                embed.addFields({
                    name: `✅ Filleuls Validés (${validatedReferrals.length})`,
                    value: (validatedList + (validatedReferrals.length > 3 ? `\n... et ${validatedReferrals.length - 3} autres` : '')).substring(0, 1024),
                    inline: false
                });
            }

            // Afficher les filleuls en attente
            if (pendingReferrals.length > 0) {
                const pendingList = pendingReferrals.slice(0, 3).map(r => {
                    return `**${r.referred_username || 'Inconnu'}** - En attente de validation`;
                }).join('\n');

                embed.addFields({
                    name: `⏳ En Attente de Validation (${pendingReferrals.length})`,
                    value: (pendingList + (pendingReferrals.length > 3 ? `\n... et ${pendingReferrals.length - 3} autres` : '')).substring(0, 1024),
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
            if (error.code === 10062 || error.code === 40060) return;
            try {
                if (deferred) {
                    await interaction.editReply({
                        content: `❌ Erreur lors de l'affichage des parrainages.\n*${(error.message || 'Erreur inconnue').substring(0, 100)}*`
                    });
                } else {
                    await interaction.reply({ content: '❌ Erreur. Réessaie.', ephemeral: true });
                }
            } catch (e) {
                if (e.code !== 10062 && e.code !== 40060) console.error('Erreur réponse mes-parrainages:', e);
            }
        }
    }
};
