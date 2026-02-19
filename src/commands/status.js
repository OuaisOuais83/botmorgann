const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const monitor = require('../utils/health');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('🏥 Vérifier l\'état de santé du bot (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!security.isAdmin(interaction.member)) {
            return interaction.reply({ content: '❌ Accès refusé.', ephemeral: true });
        }

        const stats = monitor.getSystemStatus();
        const embed = new EmbedBuilder()
            .setColor(stats.errorCount > 0 ? '#FFA500' : '#00FF00')
            .setTitle('🏥 État du Système')
            .addFields(
                { name: 'Statut', value: stats.status, inline: true },
                { name: 'Uptime', value: stats.uptime, inline: true },
                { name: 'Mémoire', value: `RSS: ${stats.memory.rss}\nHeap: ${stats.memory.heapUsed}`, inline: true },
                { name: 'Erreurs (Session)', value: stats.errorCount.toString(), inline: true },
                { name: 'Système', value: `${stats.system.platform}`, inline: true }
            )
            .setTimestamp();

        if (stats.lastErrors.length > 0) {
            const errorList = stats.lastErrors.map(e => `[${e.timestamp.split('T')[1].split('.')[0]}] ${e.message}`).join('\n');
            embed.addFields({ name: 'Dernières Erreurs', value: `\`\`\`${errorList.substring(0, 1000)}\`\`\`` });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
