const { SlashCommandBuilder } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-stats-affiliation')
        .setDescription('💰 Voir ton résumé de statistiques d\'affiliation Tap.it'),

    async execute(interaction) {
        try {
            const accounts = await database.getSocialAccounts(interaction.user.id);

            if (accounts.length === 0) {
                return interaction.reply({
                    embeds: [embeds.info(
                        '💰 Stats Affiliation',
                        `Tu n'as pas encore de comptes sociaux déclarés.\n\n` +
                        `Utilise \`/declare-accounts\` pour commencer à farmer !`
                    )],
                    ephemeral: true
                });
            }

            // Construire le résumé
            let description = 'Voici le résumé de tes comptes d\'affiliation :\n\n';
            let activeCount = 0;

            accounts.forEach((acc) => {
                if (acc.status === 'active') {
                    activeCount++;
                    description += `✅ **${acc.platform}** (${acc.handle})\n`;
                    description += `🔗 Lien : ${acc.tapitLink}\n\n`;
                } else {
                    description += `⏳ **${acc.platform}** (${acc.handle})\n`;
                    description += `*Lien en attente de génération par un admin.*\n\n`;
                }
            });

            description += `\n**📊 Pour voir tes clics et tes gains réels :**\n`;
            description += `Rends-toi sur ton **[Tableau de Bord Tap.it](https://taap.it/dashboard)**.\n\n`;
            description += `*Les paiements sont effectués le 5 de chaque mois (min. 50€).*`;

            await interaction.reply({
                embeds: [embeds.info(
                    '💰 TES STATS D\'AFFILIATION',
                    description
                )],
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur /my-stats-affiliation:', error);
            await interaction.reply({
                embeds: [embeds.error(
                    'Erreur',
                    'Une erreur est survenue lors de la récupération de tes stats.'
                )],
                ephemeral: true
            });
        }
    }
};
