const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const database = require('../database/db');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('declare-accounts')
        .setDescription('📱 Déclarer un compte social pour l\'affiliation'),

    async execute(interaction) {
        try {
            console.log(`[DECLARE] User ${interaction.user.tag} started declaration.`);

            // Vérifier si l'utilisateur existe
            let user = await database.getUser(interaction.user.id);
            if (!user) {
                console.log(`[DECLARE] Creating new user ${interaction.user.tag}`);
                user = await database.createUser(interaction.user.id, interaction.user.username);
            }

            // Vérifier combien de comptes l'utilisateur a déjà
            const currentAccounts = await database.getSocialAccounts(interaction.user.id);
            if (currentAccounts.length >= 15) {
                return interaction.reply({
                    embeds: [embeds.warning(
                        'Limite atteinte',
                        `Tu as déjà déclaré le maximum de 15 comptes sociaux.\n\n` +
                        `Utilise \`/my-accounts\` pour voir tes comptes.`
                    )],
                    ephemeral: true
                });
            }

            // Créer le modal
            const modal = new ModalBuilder()
                .setCustomId('declare_account_modal')
                .setTitle('📱 Ajouter un Compte Social');

            const platformInput = new TextInputBuilder()
                .setCustomId('platform')
                .setLabel('Plateforme')
                .setPlaceholder('TikTok, Instagram, YouTube...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(30);

            const handleInput = new TextInputBuilder()
                .setCustomId('handle')
                .setLabel('@ ou Username')
                .setPlaceholder('@monclipage')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(50);

            const linkInput = new TextInputBuilder()
                .setCustomId('profileLink')
                .setLabel('Lien direct de ton profil')
                .setPlaceholder('https://www.tiktok.com/@tonpseudo')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const followersInput = new TextInputBuilder()
                .setCustomId('followers')
                .setLabel('Nombre de Followers (optionnel)')
                .setPlaceholder('15000')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(10);

            modal.addComponents(
                new ActionRowBuilder().addComponents(platformInput),
                new ActionRowBuilder().addComponents(handleInput),
                new ActionRowBuilder().addComponents(linkInput),
                new ActionRowBuilder().addComponents(followersInput)
            );

            if (interaction.replied || interaction.deferred) {
                console.log('[DECLARE] Interaction déjà traitée, annulation showModal.');
                return;
            }
            await interaction.showModal(modal);

            // Attendre la soumission
            const filter = (i) => i.customId === 'declare_account_modal' && i.user.id === interaction.user.id;

            try {
                const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300000 });
                // Important: Defer update to allow time for processing
                await modalInteraction.deferReply({ ephemeral: true });

                const platform = modalInteraction.fields.getTextInputValue('platform').trim();
                const handle = modalInteraction.fields.getTextInputValue('handle').trim();
                const profileLink = modalInteraction.fields.getTextInputValue('profileLink').trim();
                const followersStr = modalInteraction.fields.getTextInputValue('followers')?.trim() || '0';

                let followers = 0;
                if (followersStr) {
                    followers = parseInt(followersStr.replace(/[^0-9]/g, ''));
                    if (isNaN(followers)) followers = 0;
                }

                console.log(`[DECLARE] Processing data for ${interaction.user.tag}: ${platform} ${handle}`);

                // Ajouter le compte
                try {
                    const account = await database.addSocialAccount(
                        interaction.user.id,
                        platform,
                        handle,
                        profileLink,
                        followers
                    );

                    const newTotal = (await database.getSocialAccounts(interaction.user.id)).length;

                    await modalInteraction.editReply({
                        embeds: [embeds.success(
                            '✅ Compte ajouté !',
                            `**📱 ${platform}** - ${account.handle}\n` +
                            `🔗 [Voir le profil](${profileLink})\n` +
                            (followers > 0 ? `👥 ${followers.toLocaleString('fr-FR')} followers\n\n` : '\n') +
                            `Tu as maintenant **${newTotal}** comptes déclarés.\n\n` +
                            `Un admin va générer ton lien Tap.it sous 24-48h.\n` +
                            `Tu recevras une notification quand c'est prêt ! 🚀`
                        )]
                    });

                    // Notifier
                    const notifications = require('../utils/notifications');
                    await notifications.notifyAccountDeclaration(
                        modalInteraction.guild,
                        interaction.user,
                        account,
                        newTotal
                    );
                    console.log(`[DECLARE] Notification sent for ${interaction.user.tag}`);

                } catch (dbError) {
                    console.error('[DECLARE] DB Error:', dbError);
                    await modalInteraction.editReply({
                        embeds: [embeds.error('Erreur Base de Données', dbError.message)]
                    });
                }

            } catch (err) {
                if (err.code !== 'InteractionCollectorError') {
                    console.error('[DECLARE] Modal Error:', err);
                }
            }

        } catch (error) {
            console.error('Erreur critique /declare-accounts:', error);
        }
    }
};
