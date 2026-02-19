const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin-accounts')
        .setDescription('👨‍💼 [ADMIN] Voir tous les comptes sociaux d\'un monteur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Monteur à consulter')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const accounts = database.getSocialAccounts(targetUser.id);

            if (accounts.length === 0) {
                return interaction.reply({
                    embeds: [embeds.info(
                        '📱 Aucun Compte Déclaré',
                        `${targetUser} n'a pas encore déclaré de comptes sociaux.`
                    )],
                    ephemeral: true
                });
            }

            // Construire la liste détaillée
            let accountsList = `**👤 ${targetUser.username}** (Discord ID: ${targetUser.id})\n\n`;

            accounts.forEach((acc, index) => {
                const statusEmoji = acc.status === 'active' ? '✅' : '⏳';

                accountsList += `**${index + 1}️⃣ ${acc.platform}**\n`;
                accountsList += `   @ : ${acc.handle}\n`;
                accountsList += `   🌐 : [Lien Profil](${acc.profileLink || '#'})\n`;
                if (acc.followers > 0) {
                    accountsList += `   👥 : ${acc.followers.toLocaleString('fr-FR')} followers\n`;
                }
                accountsList += `   🔗 : ${acc.tapitLink || '⏳ À générer'}\n`;
                accountsList += `   ${statusEmoji} : ${acc.status === 'active' ? 'Actif' : 'En attente'}\n`;
                accountsList += `   📅 : ${new Date(acc.declaredAt).toLocaleDateString('fr-FR')}\n\n`;
            });

            accountsList += `**Total : ${accounts.length} comptes déclarés**`;

            await interaction.reply({
                embeds: [embeds.info(
                    `📱 COMPTES SOCIAUX - ${targetUser.username}`,
                    accountsList
                )],
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur /admin-accounts:', error);
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
