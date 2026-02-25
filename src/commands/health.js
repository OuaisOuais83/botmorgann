const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config');
const monitor = require('../utils/health');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('health')
        .setDescription('🩺 [ADMIN] Vérifier l\'état du bot et de la base de données')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!security.isAdmin(interaction.member)) {
            return interaction.reply({
                embeds: [embeds.error('Accès refusé', 'Réservé aux administrateurs.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const status = monitor.getSystemStatus();
            const db = require('../database');

            let dbOk = false;
            let dbError = null;
            try {
                const users = await db.getAllUsers();
                dbOk = Array.isArray(users);
            } catch (err) {
                dbError = err.message;
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('🩺 État du système')
                .addFields(
                    { name: '🤖 Bot', value: `Statut: **${status.status}**\nUptime: ${status.uptime}`, inline: true },
                    { name: '💾 Mémoire', value: `RSS: ${status.memory.rss}\nHeap: ${status.memory.heapUsed}`, inline: true },
                    { name: '📦 Base de données', value: dbOk ? '✅ Connectée' : `❌ ${dbError || 'Erreur'}`, inline: true },
                    { name: '❌ Erreurs récentes', value: String(status.errorCount), inline: true }
                )
                .setTimestamp();

            if (status.lastErrors?.length > 0) {
                const lastErr = status.lastErrors[0];
                embed.addFields({
                    name: 'Dernière erreur',
                    value: `\`\`\`${(lastErr.message || lastErr).toString().substring(0, 200)}\`\`\``,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            await interaction.editReply({
                embeds: [embeds.error('Erreur', `Impossible de récupérer le statut: ${err.message}`)]
            });
        }
    }
};
