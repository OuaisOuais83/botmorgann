const { SlashCommandBuilder } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-account')
        .setDescription('🗑️ Supprimer un de tes comptes sociaux déclarés')
        .addStringOption(option =>
            option.setName('plateforme')
                .setDescription('La plateforme (TikTok, Instagram...)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('handle')
                .setDescription('Ton @Pseudo exact')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const platform = interaction.options.getString('plateforme');
            const handle = interaction.options.getString('handle');

            const success = await database.removeSocialAccount(interaction.user.id, platform, handle);

            if (success) {
                await interaction.reply({
                    embeds: [embeds.success(
                        'Compte supprimé',
                        `Le compte **${platform}** (${handle}) a été retiré de ta liste.`
                    )],
                    ephemeral: true
                });

                // Notifier les admins si besoin
                const trackingChannel = interaction.guild.channels.cache.find(c => c.name === 'tracking-comptes');
                if (trackingChannel) {
                    await trackingChannel.send({
                        embeds: [embeds.warning(
                            '🗑️ Compte Supprimé',
                            `**Utilisateur:** ${interaction.user.username}\n**Plateforme:** ${platform}\n**Handle:** ${handle}`
                        )]
                    });
                }
            } else {
                await interaction.reply({
                    embeds: [embeds.error(
                        'Introuvable',
                        `Nous n'avons pas trouvé de compte **${platform}** avec le pseudo **${handle}** dans ta liste.`
                    )],
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erreur /remove-account:', error);
            await interaction.reply({
                embeds: [embeds.error('Erreur', 'Une erreur est survenue.')],
                ephemeral: true
            });
        }
    }
};
