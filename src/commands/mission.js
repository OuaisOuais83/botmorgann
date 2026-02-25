const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { createMission, getAvailableMissions, assignMission, createSubmission, getMission, getUser, createUser } = require('../database');
const embeds = require('../utils/embeds');
const security = require('../utils/security');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mission')
        .setDescription('🎬 Gestion des missions de montage')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('📝 Créer une nouvelle mission (ADMIN)')
                .addStringOption(option => option.setName('titre').setDescription('Titre de la mission').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Description').setRequired(true))
                .addNumberOption(option => option.setName('points').setDescription('Nombre de points à gagner').setRequired(true))
                .addStringOption(option => option.setName('type').setDescription('Type de mission').setRequired(false)
                    .addChoices(
                        { name: '👔 Client (Standard)', value: 'standard' },
                        { name: 'Express (5-15s)', value: 'express' },
                        { name: 'Premium (1-3min)', value: 'premium' },
                        { name: 'Compilation (5-10min)', value: 'compilation' }
                    ))
                .addStringOption(option => option.setName('deadline').setDescription('Deadline (ex: 24h)').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('📋 Voir les missions disponibles')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('✋ Prendre une mission')
                .addIntegerOption(option => option.setName('id').setDescription('ID de la mission').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('submit')
                .setDescription('📤 Soumettre un clip terminé')
                .addIntegerOption(option => option.setName('id').setDescription('ID de la mission').setRequired(true))
                .addStringOption(option => option.setName('lien').setDescription('Lien vers le clip').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            // Vérifier les permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ embeds: [embeds.error('Erreur', 'Commande réservée aux admins')], ephemeral: true });
            }

            const titre = interaction.options.getString('titre');
            const description = interaction.options.getString('description');
            const points = interaction.options.getNumber('points');
            const type = interaction.options.getString('type') || 'standard';
            const deadline = interaction.options.getString('deadline') || 'Flexible';

            await createMission(titre, description, type, points, deadline, interaction.user.id);

            const clipsChannel = interaction.guild.channels.cache.find(ch => ch.name.includes('missions-hebdo'));
            if (clipsChannel) {
                await clipsChannel.send({
                    content: '@here 🆕 **Nouvelle mission communautaire !**',
                    embeds: [embeds.info(
                        `🎬 ${titre}`,
                        `**Objectif:** ${description}\n**Type:** ${type === 'standard' ? '👔 Client' : type}\n**Récompense:** 🌾 ${points} points\n**Deadline:** ${deadline}\n\n*Cette mission sert à s'entraîner ensemble sur les Hooks. Tes statistiques d'affiliation Tap.it sont tes seuls revenus directs.*`
                    )]
                });
            }

            await interaction.reply({ embeds: [embeds.success('Mission créée', `La mission communautaire "${titre}" a été postée dans le canal practice !`)] });

        } else if (subcommand === 'list') {
            const missions = await getAvailableMissions();

            if (missions.length === 0) {
                return interaction.reply({ embeds: [embeds.info('Aucune mission', 'Pas de missions disponibles pour le moment.')], ephemeral: true });
            }

            const list = missions.map(m => `**#${m.id}** - ${m.title} | 🌾 ${m.payment} pts | ${m.type === 'standard' ? '👔 Client' : m.type}`).join('\n');

            await interaction.reply({
                embeds: [embeds.info('🎬 Missions disponibles', list)],
                ephemeral: true
            });

        } else if (subcommand === 'claim') {
            // Vérifier le rate limit (sécurité)
            const rateLimit = security.checkRateLimit(interaction.user.id, 'mission-claim', 10);
            if (!rateLimit.allowed) {
                return interaction.reply({
                    embeds: [embeds.warning('Trop rapide', `Attends ${rateLimit.timeLeft}s avant de prendre une autre mission.`)],
                    ephemeral: true
                });
            }

            // AUTO-PROFILE : S'assurer que l'utilisateur existe en DB s'il a le rôle
            let userData = await getUser(interaction.user.id);
            if (!userData) {
                const projectRoles = ['🥉 Rookie', '🥈 Hustler', '🥇 Grinder', '💎 Elite'];
                const hasRole = interaction.member.roles.cache.some(r => projectRoles.includes(r.name));
                if (hasRole) {
                    userData = await createUser(interaction.user.id, interaction.user.username);
                } else {
                    return interaction.reply({ embeds: [embeds.error('Accès refusé', 'Tu dois être membre (Rookie+) pour prendre des missions. Postule via le bouton Postuler dans #accueil.')], ephemeral: true });
                }
            }

            const id = interaction.options.getInteger('id');
            const mission = await getMission(id);

            if (!mission) {
                return interaction.reply({ embeds: [embeds.error('Erreur', 'Mission introuvable')], ephemeral: true });
            }

            if (mission.status !== 'available') {
                return interaction.reply({ embeds: [embeds.error('Erreur', 'Mission déjà prise')], ephemeral: true });
            }

            await assignMission(id, interaction.user.id);

            await interaction.reply({
                embeds: [embeds.success(
                    'Mission assignée!',
                    `✅ Tu as récupéré la mission **${mission.title}**!\n\nUtilise \`/mission submit ${id} [lien]\` pour soumettre ton clip.`
                )]
            });

        } else if (subcommand === 'submit') {
            const id = interaction.options.getInteger('id');
            const lien = interaction.options.getString('lien');

            // Valider l'URL (sécurité)
            const urlValidation = security.validateURL(lien);
            if (!urlValidation.valid) {
                return interaction.reply({
                    embeds: [embeds.error('URL invalide', urlValidation.reason)],
                    ephemeral: true
                });
            }

            const mission = await getMission(id);

            if (!mission) {
                return interaction.reply({ embeds: [embeds.error('Erreur', 'Mission introuvable')], ephemeral: true });
            }

            if (mission.assigned_to !== interaction.user.id) {
                return interaction.reply({ embeds: [embeds.error('Erreur', 'Cette mission ne t\'est pas assignée')], ephemeral: true });
            }

            // AUTO-PROFILE : S'assurer que l'utilisateur existe en DB s'il a le rôle
            let userData = await getUser(interaction.user.id);
            if (!userData) {
                const projectRoles = ['🥉 Rookie', '🥈 Hustler', '🥇 Grinder', '💎 Elite'];
                const hasRole = interaction.member.roles.cache.some(r => projectRoles.includes(r.name));
                if (hasRole) {
                    userData = await createUser(interaction.user.id, interaction.user.username);
                }
            }

            await createSubmission(id, interaction.user.id, lien);

            const validationChannel = interaction.guild.channels.cache.find(ch => ch.name.includes('validation-clips'));
            if (validationChannel) {
                await validationChannel.send({
                    content: '@here 📤 **Nouveau clip à valider!**',
                    embeds: [embeds.info(
                        `Soumission de ${interaction.user.username}`,
                        `**Mission:** ${mission.title}\n**Lien:** ${lien}\n\nUtilise \`/validate\` pour noter ce clip.`
                    )]
                });
            }

            const logo = new AttachmentBuilder(path.join(__dirname, '../../assets/logo.png'), { name: 'logo.png' });
            await interaction.reply({
                embeds: [embeds.success('Clip soumis!', 'Ton clip a été envoyé en validation. Tu recevras une notification dès qu\'il sera validé! ⏳')],
                files: [logo]
            });
        }
    }
};
