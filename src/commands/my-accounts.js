const { SlashCommandBuilder } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-accounts')
        .setDescription('📱 Voir tes comptes sociaux déclarés'),

    async execute(interaction) {
        try {
            const accounts = await database.getSocialAccounts(interaction.user.id);

            if (accounts.length === 0) {
                return interaction.reply({
                    embeds: [embeds.info(
                        '📱 Aucun Compte Déclaré',
                        `Tu n'as pas encore déclaré de comptes sociaux.\n\n` +
                        `Utilise \`/declare-accounts\` pour ajouter un compte !`
                    )],
                    ephemeral: true
                });
            }

            // Construire la liste des comptes
            let accountsList = '';
            accounts.forEach((acc, index) => {
                const statusEmoji = acc.status === 'active' ? '✅' : '⏳';
                const linkText = acc.tapitLink ? acc.tapitLink : 'En attente';

                accountsList += `**${index + 1}. ${acc.platform}**\n`;
                accountsList += `   @ : ${acc.handle}\n`;
                if (acc.followers > 0) {
                    accountsList += `   👥 : ${acc.followers.toLocaleString('fr-FR')} followers\n`;
                }
                accountsList += `   🔗 : ${linkText}\n`;
                accountsList += `   ${statusEmoji} : ${acc.status === 'active' ? 'Actif' : 'En attente'}\n\n`;
            });

            await interaction.reply({
                embeds: [embeds.info(
                    '📱 TES COMPTES SOCIAUX',
                    accountsList +
                    `**Total : ${accounts.length} comptes déclarés**\n\n` +
                    `💡 Utilise \`/declare-accounts\` pour ajouter un compte.`
                )],
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur /my-accounts:', error);
            await interaction.reply({
                embeds: [embeds.error(
                    'Erreur',
                    'Une erreur est survenue.'
                )],
                ephemeral: true
            });
        }
    }
};
