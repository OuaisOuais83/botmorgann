const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getSubmission, validateSubmission, updateUserPoints, incrementClipsCompleted, completeMission, getUser, updateUserLevel, getUserSubmissions, createAuditLog } = require('../database');
const config = require('../config');
const embeds = require('../utils/embeds');
const { onFirstMissionCompleted } = require('../utils/referralTracking');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('validate')
        .setDescription('✅ Valider un clip soumis (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('id').setDescription('ID de la soumission').setRequired(true))
        .addStringOption(option => option.setName('note').setDescription('Note du clip').setRequired(true)
            .addChoices(
                { name: 'A+ - Parfait, viral potential', value: 'A+' },
                { name: 'A - Excellent', value: 'A' },
                { name: 'B - Bon, publication OK', value: 'B' },
                { name: 'C - Acceptable, révisions', value: 'C' },
                { name: 'F - Refusé', value: 'F' }
            ))
        .addStringOption(option => option.setName('feedback').setDescription('Commentaire privé pour le monteur').setRequired(false))
        .addStringOption(option => option.setName('analyse').setDescription('Analyse du Hook pour la communauté (Public)').setRequired(false)),

    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const grade = interaction.options.getString('note');
        const feedback = interaction.options.getString('feedback') || 'Pas de commentaire';
        const analyse = interaction.options.getString('analyse');

        const submission = await getSubmission(id);

        if (!submission) {
            return interaction.reply({ embeds: [embeds.error('Erreur', 'Soumission introuvable')], ephemeral: true });
        }

        if (submission.grade) {
            return interaction.reply({ embeds: [embeds.error('Erreur', 'Ce clip a déjà été validé')], ephemeral: true });
        }

        // Calculer les points selon la note
        const gradeData = config.grades[grade];
        const pointsEarned = gradeData.points;

        // Valider la soumission (On garde les points, pas l'argent direct)
        await validateSubmission(id, grade, pointsEarned, feedback, interaction.user.id);

        // Mettre à jour les stats de l'utilisateur
        await updateUserPoints(submission.user_id, pointsEarned);
        await incrementClipsCompleted(submission.user_id);

        // Marquer la mission comme complétée
        await completeMission(submission.mission_id);

        // Vérifier si c'est la première mission validée (pour parrainage)
        const userSubmissions = await getUserSubmissions(submission.user_id);
        const validatedMissions = userSubmissions.filter(s => s.grade && s.grade !== 'F');
        if (validatedMissions.length === 1) {
            // C'est sa première mission validée !
            await onFirstMissionCompleted(submission.user_id, interaction.client);
        }

        // Publication de l'analyse dans le canal motivation/entraide
        if (analyse) {
            const motivationChannel = interaction.guild.channels.cache.find(ch => ch.name.includes('entraide-technique') || ch.name.includes('notre-vision'));
            if (motivationChannel) {
                await motivationChannel.send({
                    content: `🔥 **ANALYSE DE HOOK - APPRENONS ENSEMBLE**`,
                    embeds: [embeds.info(
                        `Analyse du clip de ${submission.username}`,
                        `**Note:** ${gradeData.emoji} ${grade}\n\n**💡 Le Tip de l'Exert :**\n${analyse}`
                    )]
                });
            }
        }

        // Log d'audit
        await createAuditLog(
            'CLIP_VALIDATED',
            interaction.user.id,
            interaction.user.username,
            submission.user_id,
            submission.username,
            `Clip #${id} validé: note ${grade}, +${pointsEarned} pts pour <@${submission.user_id}>`
        );

        // Vérifier si l'utilisateur doit passer au niveau suivant
        const user = await getUser(submission.user_id);
        const newLevel = calculateLevel(user.points);

        if (newLevel !== user.level) {
            await updateUserLevel(submission.user_id, newLevel);

            // Annoncer la promotion
            const member = await interaction.guild.members.fetch(submission.user_id);
            const newRole = interaction.guild.roles.cache.find(r => r.name === config.roles[newLevel].name);

                if (newRole) {
                await member.roles.add(newRole);

                await createAuditLog(
                    'LEVEL_UP',
                    interaction.user.id,
                    interaction.user.username,
                    submission.user_id,
                    member.user.username,
                    `Promotion: ${user.level} → ${newLevel} (${user.points} pts)`
                );

                // Retirer l'ancien rôle
                const oldRole = interaction.guild.roles.cache.find(r => r.name === config.roles[user.level].name);
                if (oldRole) await member.roles.remove(oldRole);

                // Annoncer
                const announcementChannel = interaction.guild.channels.cache.find(ch => ch.name.includes('notre-vision') || ch.name.includes('accueil'));
                if (announcementChannel) {
                    announcementChannel.send({
                        content: `🎉 @everyone`,
                        embeds: [embeds.success(
                            '👑 PROMOTION!',
                            `**${member.user.username}** vient de passer au niveau **${config.levels[newLevel].name.toUpperCase()}**! 🚀\n\nFélicitations pour ton engagement dans la league! 💪`
                        )]
                    });
                }
            }
        }

        // Notifier le farmer
        try {
            const member = await interaction.guild.members.fetch(submission.user_id);
            await member.send({
                embeds: [embeds.success(
                    `${gradeData.emoji} Clip validé - Note: ${grade}`,
                    `**Points gagnés:** +${pointsEarned} pts\n**Feedback Admin:** ${feedback}\n\n*Rappel: Tes revenus sont générés par tes clics d'affiliation Tap.it.* 💪`
                )]
            });
        } catch (err) {
            console.log('Impossible d\'envoyer un DM');
        }

        await interaction.reply({
            embeds: [embeds.success(
                'Clip validé',
                `✅ Soumission #${id} validée avec la note **${grade}**\n\n` +
                `${pointsEarned} points attribués à <@${submission.user_id}>`
            )]
        });
    }
};

function calculateLevel(points) {
    if (points >= config.levels.elite.min) return 'elite';
    if (points >= config.levels.grinder.min) return 'grinder';
    if (points >= config.levels.hustler.min) return 'hustler';
    return 'rookie';
}
