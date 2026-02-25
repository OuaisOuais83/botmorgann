const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const embeds = require('../utils/embeds');
const security = require('../utils/security');
const { onApplicationApproved } = require('../utils/referralTracking');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('👨‍💼 Examiner les candidatures (ADMIN)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Voir les candidatures en attente'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('accepter')
                .setDescription('Approuver une candidature')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID de la candidature')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('refuser')
                .setDescription('Refuser une candidature')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID de la candidature')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('raison')
                        .setDescription('Raison du refus')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Sécurité
        if (!security.isAdmin(interaction.member)) {
            return interaction.reply({
                embeds: [embeds.error('Accès refusé', 'Tu n\'as pas la permission d\'utiliser cette commande.')],
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const db = require('../database');

        // --- SOUS-COMMANDE : LISTE ---
        if (subcommand === 'liste') {
            await interaction.deferReply({ ephemeral: true });
            const applications = await db.getPendingApplications();

            if (applications.length === 0) {
                return interaction.editReply({
                    embeds: [embeds.info('Aucune candidature', 'Il n\'y a aucune candidature en attente pour le moment.')]
                });
            }

            await interaction.editReply({ content: `🔍 **${applications.length} candidatures en attente**` });

            for (const app of applications.slice(0, 5)) {
                await interaction.followUp({
                    embeds: [embeds.application(app)],
                    ephemeral: true
                });
            }
        }

        // --- SOUS-COMMANDE : ACCEPTER ---
        else if (subcommand === 'accepter') {
            await interaction.deferReply({ ephemeral: true });
            const appId = parseInt(interaction.options.getString('id'));
            const application = await db.getApplication(appId);

            if (!application) {
                return interaction.editReply({
                    embeds: [embeds.error('Introuvable', `La candidature #${appId} n'existe pas.`)]
                });
            }

            if (application.status !== 'pending') {
                return interaction.editReply({
                    embeds: [embeds.warning('Déjà traitée', `Cette candidature est déjà ${application.status}.`)]
                });
            }

            // 1. Mettre à jour le statut
            await db.updateApplicationStatus(appId, 'approved', interaction.user.id);

            // Log d'audit
            await db.createAuditLog(
                'APPLICATION_APPROVED',
                interaction.user.id,
                interaction.user.username,
                application.user_id,
                application.username,
                `Candidature #${appId} approuvée`
            );

            // 2. Créer l'utilisateur dans la DB
            let user = await db.getUser(application.user_id);
            if (!user) {
                user = await db.createUser(application.user_id, application.username);
            }

            // 3. Attribuer les rôles
            try {
                const member = await interaction.guild.members.fetch(application.user_id);
                const roleRookie = interaction.guild.roles.cache.find(r => r.name === config.roles.rookie?.name || r.name?.includes('Rookie'));
                const roleCandidat = interaction.guild.roles.cache.find(r => r.name.includes('Candidat'));

                if (roleRookie) await member.roles.add(roleRookie);
                if (roleCandidat) await member.roles.remove(roleCandidat);

                // 4. DM de bienvenue
                await member.send({
                    embeds: [embeds.success(
                        'Candidature Approuvée ! 🎉',
                        `Bravo **${application.username}**, tu as rejoint la **Farmer League** !\n\n` +
                        `Ton grade : **Rookie**\n` +
                        `Ton objectif : Poster des clips et monter en grade !\n\n` +
                        `Va voir le salon <#${config.channels.missions}> pour ta première mission ! 🚀`
                    )]
                }).catch(() => console.log(`Impossible d'envoyer DM à ${application.username}`));

            } catch (error) {
                console.error('Erreur rôles/DM:', error);
            }

            // 5. Récompense Parrainage
            await onApplicationApproved(application.user_id, interaction.client);

            // 6. Notifications
            const notifications = require('../utils/notifications');
            await notifications.notifyReview(interaction.guild, application, 'approved', interaction.user);

            await interaction.editReply({
                embeds: [embeds.success('Validé', `La candidature #${appId} a été approuvée avec succès.`)]
            });
        }

        // --- SOUS-COMMANDE : REFUSER ---
        else if (subcommand === 'refuser') {
            await interaction.deferReply({ ephemeral: true });
            const appId = parseInt(interaction.options.getString('id'));
            const reason = interaction.options.getString('raison');
            const application = await db.getApplication(appId);

            if (!application) {
                return interaction.editReply({
                    embeds: [embeds.error('Introuvable', `La candidature #${appId} n'existe pas.`)]
                });
            }

            if (application.status !== 'pending') {
                return interaction.editReply({
                    embeds: [embeds.warning('Déjà traitée', `Cette candidature est déjà ${application.status}.`)]
                });
            }

            // Update statut
            await db.updateApplicationStatus(appId, 'rejected', interaction.user.id);

            // Log d'audit
            await db.createAuditLog(
                'APPLICATION_REJECTED',
                interaction.user.id,
                interaction.user.username,
                application.user_id,
                application.username,
                `Candidature #${appId} refusée. Raison: ${reason}`
            );

            // DM Refus
            try {
                const member = await interaction.guild.members.fetch(application.user_id);
                await member.send({
                    embeds: [embeds.error(
                        'Candidature Refusée',
                        `Désolé **${application.username}**, ta candidature n'a pas été retenue.\n\n` +
                        `**Raison :** ${reason}`
                    )]
                });
            } catch (e) {
                console.log(`DM échoué pour ${application.username}`);
            }

            // Notifications
            const notifications = require('../utils/notifications');
            await notifications.notifyReview(interaction.guild, application, 'rejected', interaction.user);

            await interaction.editReply({
                embeds: [embeds.success('Rejeté', `La candidature #${appId} a été refusée.`)]
            });
        }
    }
};
