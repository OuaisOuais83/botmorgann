const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('📋 [ADMIN] Voir les logs d\'audit récents')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Filtrer par type d\'action')
                .addChoices(
                    { name: 'Tous', value: 'all' },
                    { name: 'Validations de clips', value: 'CLIP_VALIDATED' },
                    { name: 'Promotions niveau', value: 'LEVEL_UP' },
                    { name: 'Candidatures approuvées', value: 'APPLICATION_APPROVED' },
                    { name: 'Candidatures refusées', value: 'APPLICATION_REJECTED' },
                    { name: 'Demandes de paiement', value: 'PAYMENT_REQUESTED' }
                ))
        .addIntegerOption(option =>
            option.setName('limite')
                .setDescription('Nombre de logs à afficher (défaut: 20)')
                .setMinValue(5)
                .setMaxValue(50)),

    async execute(interaction) {
        if (!security.isAdmin(interaction.member)) {
            return interaction.reply({
                embeds: [embeds.error('Accès refusé', 'Réservé aux administrateurs.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const type = interaction.options.getString('type') || 'all';
        const limit = interaction.options.getInteger('limite') || 20;

        let logs;
        if (type === 'all') {
            logs = await database.getRecentAuditLogs(limit);
        } else {
            logs = await database.getAuditLogsByAction(type);
            logs = logs.slice(0, limit);
        }

        const title = type === 'all' ? '📋 Logs d\'audit admin' : `📋 Logs: ${type}`;
        await interaction.editReply({
            embeds: [embeds.auditLogs(logs, title)]
        });
    }
};
