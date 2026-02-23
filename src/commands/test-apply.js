const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-apply')
        .setDescription('[ADMIN] Tester le formulaire /apply sans créer de candidature'),

    async execute(interaction) {
        try {
            // Vérifier si c'est un admin
            if (interaction.user.id !== process.env.ADMIN_ID && !interaction.member.roles.cache.some(role => role.name.includes('Admin'))) {
                await interaction.reply({
                    content: '❌ Cette commande est réservée aux administrateurs.',
                    ephemeral: true
                });
                return;
            }

            // Créer le modal de test (identique à /apply mais en mode test)
            const modal = new ModalBuilder()
                .setCustomId('test-application-modal')
                .setTitle('🧪 TEST - Formulaire de Candidature');

            const instagramInput = new TextInputBuilder()
                .setCustomId('instagram')
                .setLabel('Pseudo Instagram (ou TikTok/YouTube)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('@ton_compte')
                .setRequired(true)
                .setMaxLength(100);

            const portfolioInput = new TextInputBuilder()
                .setCustomId('portfolio')
                .setLabel('Lien Portfolio (Drive, Behance, etc.)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('https://...')
                .setRequired(true)
                .setMaxLength(500);

            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('Ton Expérience (montage vidéo)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Ex: 2 ans de montage pour des créateurs gaming, maîtrise Premiere Pro...')
                .setRequired(true)
                .setMaxLength(1000);

            const firstRow = new ActionRowBuilder().addComponents(instagramInput);
            const secondRow = new ActionRowBuilder().addComponents(portfolioInput);
            const thirdRow = new ActionRowBuilder().addComponents(experienceInput);

            modal.addComponents(firstRow, secondRow, thirdRow);

            await interaction.showModal(modal);

            console.log(`🧪 [TEST-APPLY] Modal de test affiché pour ${interaction.user.tag}`);

        } catch (error) {
            console.error('Erreur /test-apply:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Erreur lors de l\'affichage du formulaire de test',
                    ephemeral: true
                });
            }
        }
    }
};
