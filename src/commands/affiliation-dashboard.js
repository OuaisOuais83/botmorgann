const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const database = require('../database');
const config = require('../config');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('affiliation-dashboard')
        .setDescription('📊 [ADMIN] Tableau de bord affiliation - Stats de tous les monteurs')
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
            const data = await database.getAffiliationDashboardData?.() || [];
            const withAccounts = data.filter(u => u.accounts?.length > 0);
            const totalReferrals = data.reduce((s, u) => s + (u.referralCount || 0), 0);
            const totalEarnings = data.reduce((s, u) => s + (u.totalEarnings || 0), 0);
            const totalAccounts = data.reduce((s, u) => s + (u.accounts?.length || 0), 0);

            const summaryEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('📊 Tableau de bord Affiliation')
                .addFields(
                    { name: '👥 Monteurs actifs', value: String(withAccounts.length), inline: true },
                    { name: '🔗 Comptes déclarés', value: String(totalAccounts), inline: true },
                    { name: '👥 Parrainages', value: String(totalReferrals), inline: true },
                    { name: '💰 Revenus totaux (estimés)', value: `${totalEarnings}€`, inline: true }
                )
                .setTimestamp();

            let detail = '';
            const toShow = withAccounts.slice(0, 15);
            for (const u of toShow) {
                const accountsStr = (u.accounts || []).map(a =>
                    `${a.platform} (@${a.handle}) ${a.status === 'active' ? '✅' : '⏳'}`
                ).join(' | ');
                detail += `**<@${u.userId}>** — ${u.referralCount || 0} parrains, ${u.totalEarnings || 0}€\n  ${accountsStr || '(aucun)'}\n\n`;
            }
            if (detail.length > 1000) detail = detail.substring(0, 997) + '...';

            if (detail) {
                summaryEmbed.addFields({ name: 'Détail par monteur (Top 15)', value: detail, inline: false });
            }

            await interaction.editReply({ embeds: [summaryEmbed] });
        } catch (err) {
            console.error('affiliation-dashboard:', err);
            await interaction.editReply({
                embeds: [embeds.error('Erreur', `Impossible de charger le tableau de bord: ${err.message}`)]
            });
        }
    }
};
