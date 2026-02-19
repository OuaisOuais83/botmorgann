const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('❓ Besoin d\'aide ou signaler un problème')
        .addStringOption(option =>
            option.setName('problème')
                .setDescription('Décris ton problème ici pour alerter le staff')
                .setRequired(false)),

    async execute(interaction) {
        const problem = interaction.options.getString('problème');

        if (problem) {
            // SIGNALEMENT DE PROBLÈME
            try {
                const supportChannel = interaction.guild.channels.cache.find(
                    c => c.name === '🆘・problèmes-support'
                );

                if (!supportChannel) {
                    return interaction.reply({
                        embeds: [embeds.error(
                            'Canal de support introuvable',
                            'Le canal de support n\'a pas encore été configuré par un administrateur.'
                        )],
                        ephemeral: true
                    });
                }

                // Trouver les rôles à ping (Admin et Modérateur)
                const adminRole = interaction.guild.roles.cache.find(r => r.name === config.roles.admin.name);
                const modRole = interaction.guild.roles.cache.find(r => r.name === config.roles.moderator.name);
                const pings = `${adminRole ? adminRole : '@Admin'} ${modRole ? modRole : '@Modérateur'}`;

                const supportEmbed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setTitle('🆘 Nouveau Problème Signalé')
                    .setDescription(`**Utilisateur:** ${interaction.user} (${interaction.user.tag})\n**Date:** <t:${Math.floor(Date.now() / 1000)}:R>`)
                    .addFields({ name: '📝 Description du problème :', value: problem })
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp();

                await supportChannel.send({
                    content: `🔔 **Alerte Support** - ${pings}`,
                    embeds: [supportEmbed]
                });

                return interaction.reply({
                    embeds: [embeds.success(
                        'Signalement envoyé !',
                        'Ton problème a été transmis à l\'équipe de management. Un modérateur ou un admin te répondra dès que possible.'
                    )],
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erreur support notification:', error);
                return interaction.reply({
                    content: '❌ Une erreur est survenue lors de l\'envoi de ton signalement.',
                    ephemeral: true
                });
            }
        } else {
            // LISTE DES COMMANDES (AIDE GÉNÉRALE)
            const helpEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('🚀 Centre d\'Aide - Farmer League')
                .setDescription(
                    'Bienvenue dans la League ! Voici les commandes essentielles pour bien débuter et gérer ton farming.'
                )
                .addFields(
                    {
                        name: '📝 Recrutement & Profil',
                        value: '`/apply` - Postuler pour rejoindre la League\n`/stats` - Voir ta progression et tes gains'
                    },
                    {
                        name: '📱 Affiliation & Comptes',
                        value: '`/declare-accounts` - Déclarer tes réseaux sociaux\n`/my-accounts` - Voir tes comptes déclarés\n`/remove-account` - Supprimer un compte'
                    },
                    {
                        name: '🎬 Missions & Gains',
                        value: '`/mission` - Voir la mission actuelle\n`/pay view` - Voir l\'état de tes paiements'
                    },
                    {
                        name: '🆘 Besoin d\'aide ?',
                        value: 'Taper `/help problème: "ton message"` pour alerter directement le staff.'
                    }
                )
                .setFooter({ text: 'Farmer League - On grandit ensemble' })
                .setTimestamp();

            return interaction.reply({
                embeds: [helpEmbed],
                ephemeral: true
            });
        }
    }
};
