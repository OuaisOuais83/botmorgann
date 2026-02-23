const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-user')
        .setDescription('🕵️ Voir les comptes déclarés d\'un membre (ADMIN)')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à vérifier')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // 1. Defer immediately (Ephemeral)
        await interaction.deferReply({ ephemeral: true });

        // Sécurité
        if (!security.isAdmin(interaction.member)) {
            return interaction.editReply({
                embeds: [embeds.error('Accès refusé', 'Réservé aux admins.')]
            });
        }

        const targetUser = interaction.options.getUser('membre');

        try {
            // Récupérer les infos de l'utilisateur
            const userDB = await database.getUser(targetUser.id);
            const accounts = await database.getSocialAccounts(targetUser.id);

            if (!userDB && accounts.length === 0) {
                return interaction.editReply({
                    embeds: [embeds.info(
                        'Utilisateur Inconnu',
                        `${targetUser.tag} n'est pas enregistré dans la base de données.`
                    )]
                });
            }

            // Construire l'affichage
            let description = `**ID:** \`${targetUser.id}\`\n`;
            description += `**Points:** ${userDB ? userDB.points : 0} 🌾\n`;
            description += `**Grade:** ${userDB ? userDB.level : 'Inconnu'}\n`;
            description += `**Parrain:** ${userDB?.referrer_username || 'Aucun'}\n\n`;

            description += `### 📱 Comptes Sociaux (${accounts.length})\n`;

            if (accounts.length === 0) {
                description += "_Aucun compte déclaré._";
            } else {
                accounts.forEach((acc, index) => {
                    const statusEmoji = acc.status === 'active' ? '✅' : '⏳';
                    const linkText = acc.tapitLink ? `[Lien Tap.it](${acc.tapitLink})` : 'Pas de lien';

                    description += `**${index + 1}. ${acc.platform}**\n`;
                    description += `   👤 Handle: \`${acc.handle}\`\n`;
                    description += `   🔗 Profil: [Voir](${acc.profileLink})\n`;
                    description += `   👥 Followers: ${acc.followers}\n`;
                    description += `   ${statusEmoji} Statut: ${acc.status}\n`;
                    if (acc.tapitLink) description += `   🔗 Affiliation: ${acc.tapitLink}\n`;
                    description += '\n';
                });
            }

            await interaction.editReply({
                embeds: [embeds.info(
                    `Dossier : ${targetUser.username}`,
                    description
                )]
            });

        } catch (error) {
            console.error('Erreur check-user:', error);
            await interaction.editReply({
                embeds: [embeds.error('Erreur', 'Impossible de récupérer les infos.')]
            });
        }
    }
};
