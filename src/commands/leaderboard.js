const { SlashCommandBuilder } = require('discord.js');
const { getTopUsers } = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 Voir le classement des farmers'),

    async execute(interaction) {
        const topUsers = getTopUsers(10);

        if (topUsers.length === 0) {
            return interaction.reply({
                embeds: [embeds.info('Leaderboard', 'Aucun farmer pour le moment.')],
                ephemeral: true
            });
        }

        await interaction.reply({
            embeds: [embeds.leaderboard(topUsers, 'all-time')]
        });
    }
};
