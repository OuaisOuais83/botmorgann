const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const compensationStrategy = require('../utils/compensationStrategy');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('strategy')
        .setDescription('🤖 Remplir le canal stratégie avec les analyses du bot (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Trouver le canal stratégie
            const stratChan = interaction.guild.channels.cache.find(ch =>
                ch.name.includes('stratégie-rémunération') || ch.name.includes('strategie')
            );

            if (!stratChan) {
                return interaction.editReply({
                    embeds: [embeds.error(
                        'Canal introuvable',
                        'Le canal stratégie-rémunération n\'existe pas. Lance `/setup` d\'abord.'
                    )]
                });
            }

            await interaction.editReply({
                embeds: [embeds.info(
                    'Remplissage en cours...',
                    `Posting des analyses dans ${stratChan}... Cela peut prendre 30 secondes.`
                )]
            });

            // Supprimer les anciens messages (optionnel)
            const oldMessages = await stratChan.messages.fetch({ limit: 100 });
            if (oldMessages.size > 0) {
                await stratChan.bulkDelete(oldMessages).catch(() => {
                    // Ignore si les messages sont trop vieux
                });
            }

            // Poster tous les messages
            let posted = 0;
            for (const message of compensationStrategy.messages) {
                try {
                    if (message.embed) {
                        const embed = new EmbedBuilder()
                            .setColor(message.color)
                            .setTitle(message.content.title)
                            .setDescription(message.content.description);

                        if (message.content.footer) {
                            embed.setFooter({ text: message.content.footer });
                        }

                        await stratChan.send({ embeds: [embed] });
                    } else {
                        await stratChan.send(message.content);
                    }

                    posted++;

                    // Délai pour éviter rate limit
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error('Erreur posting message:', error);
                }
            }

            await interaction.editReply({
                embeds: [embeds.success(
                    'Canal stratégie rempli!',
                    `✅ ${posted} messages postés dans ${stratChan}\n\n` +
                    `Les analyses de rémunération sont maintenant disponibles.\n` +
                    `Va voir le canal pour les 3 modèles optimisés!`
                )]
            });

        } catch (error) {
            console.error('Erreur commande strategy:', error);
            await interaction.editReply({
                embeds: [embeds.error(
                    'Erreur',
                    `Une erreur est survenue: ${error.message}`
                )]
            });
        }
    }
};
