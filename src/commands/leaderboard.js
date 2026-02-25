const { SlashCommandBuilder } = require('discord.js');
const { getTopUsers, getTopUsersThisWeek } = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 Voir le classement des farmers')
        .addStringOption(option =>
            option.setName('periode')
                .setDescription('Période du classement')
                .addChoices(
                    { name: '🏆 Tous les temps', value: 'all-time' },
                    { name: '📅 Cette semaine', value: 'weekly' }
                )),

    async execute(interaction) {
        const period = interaction.options.getString('periode') || 'all-time';
        const topUsers = period === 'weekly'
            ? await getTopUsersThisWeek(10)
            : await getTopUsers(10);

        if (topUsers.length === 0) {
            return interaction.reply({
                embeds: [embeds.info(
                    'Leaderboard',
                    period === 'weekly' ? 'Aucune activité cette semaine.' : 'Aucun farmer pour le moment.'
                )],
                ephemeral: true
            });
        }

        await interaction.reply({
            embeds: [embeds.leaderboard(topUsers, period === 'weekly' ? 'cette semaine' : 'all-time')]
        });
    }
};
