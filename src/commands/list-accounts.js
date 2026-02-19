const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../database/db');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-accounts')
        .setDescription('📋 Lister tous les comptes sociaux déclarés (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Sécurité
        if (!security.isAdmin(interaction.member)) {
            return interaction.reply({
                embeds: [embeds.error('Accès refusé', 'Réservé aux admins.')],
                ephemeral: true
            });
        }

        try {
            const allAccounts = database.getAllSocialAccounts();
            console.log(`[DEBUG LIST] All Accounts Raw:`, JSON.stringify(allAccounts, null, 2));

            if (!allAccounts || allAccounts.length === 0) {
                return interaction.reply({
                    embeds: [embeds.info('Aucun compte', 'Aucun compte social n\'a été déclaré pour le moment.')],
                    ephemeral: true
                });
            }

            let description = '';
            let count = 0;

            allAccounts.forEach(userEntry => {
                const { username, userId, accounts } = userEntry;
                if (accounts.length > 0) {
                    description += `\n**👤 ${username}** (\`${userId}\`)\n`;
                    accounts.forEach(acc => {
                        count++;
                        const link = acc.profileLink ? `[Lien](${acc.profileLink})` : 'N/A';
                        const followers = acc.followers ? `${acc.followers.toLocaleString()} 👥` : '';
                        description += `• **${acc.platform}**: ${acc.handle} | ${link} ${followers}\n`;
                    });
                }
            });

            // Gérer la limite de 4096 caractères des embeds
            if (description.length > 4000) {
                const chunks = description.match(/[\s\S]{1,4000}/g) || [];
                await interaction.reply({
                    embeds: [embeds.success(`📋 Liste des comptes (${count}) - Partie 1`, chunks[0])],
                    ephemeral: true
                });
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.followUp({
                        embeds: [embeds.success(`📋 Suite (${i + 1})`, chunks[i])],
                        ephemeral: true
                    });
                }
            } else {
                await interaction.reply({
                    embeds: [embeds.success(`📋 Liste des comptes déclarés (${count})`, description)],
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Erreur list-accounts:', error);
            await interaction.reply({ content: 'Erreur lors de la récupération des comptes.', ephemeral: true });
        }
    }
};
