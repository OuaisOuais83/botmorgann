const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('🎫 [ADMIN] Configurer le message Postuler dans le canal d\'accueil')
        .addChannelOption(o => o.setName('canal').setDescription('Canal où envoyer le message (défaut: accueil)').addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options?.getChannel('canal')
            || interaction.guild.channels.cache.find(c => c.name.includes('accueil'));

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: '❌ Canal d\'accueil introuvable.'
            });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🌾 Rejoindre la Farmer League')
            .setDescription(
                '**Tu veux faire partie de l\'équipe ?**\n\n' +
                'Clique sur le bouton ci-dessous pour ouvrir une candidature.\n' +
                'Un canal privé sera créé pour toi — tu pourras y remplir le formulaire.\n\n' +
                '**Réponse sous 24-48h.** 🚀'
            )
            .setFooter({ text: 'Farmer League - Postule en un clic' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open-application-ticket')
                .setLabel('Postuler')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

        await channel.send({ embeds: [embed], components: [row] });

        await interaction.editReply({
            content: `✅ Message "Postuler" envoyé dans <#${channel.id}>`
        });
    }
};
