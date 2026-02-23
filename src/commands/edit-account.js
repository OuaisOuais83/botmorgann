const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-account')
        .setDescription('✏️ Modifier un compte social déjà déclaré'),

    async execute(interaction) {
        console.log(`[DEBUG] Commande /edit-account lancée par ${interaction.user.tag} (${interaction.user.id})`);

        // 1. Defer immediately
        await interaction.deferReply({ ephemeral: true });

        try {
            // Récupérer les comptes de l'utilisateur
            const accounts = await database.getSocialAccounts(interaction.user.id);
            console.log(`[DEBUG] Comptes trouvés: ${accounts ? accounts.length : 0}`);

            if (!accounts || accounts.length === 0) {
                return interaction.editReply({
                    embeds: [embeds.error(
                        'Aucun compte',
                        'Tu n\'as déclaré aucun compte social pour le moment.\nUtilise `/declare-accounts` pour en ajouter un.'
                    )]
                });
            }

            // Créer le menu de sélection
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_account_to_edit')
                .setPlaceholder('Choisis le compte à modifier')
                .addOptions(
                    accounts.map(acc => ({
                        label: `${acc.platform} - ${acc.handle}`,
                        description: `Followers: ${acc.followers ? acc.followers.toLocaleString() : '0'}`,
                        value: acc.handle // On utilise le handle comme identifiant
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                embeds: [embeds.info(
                    'Modifier un compte',
                    'Sélectionne le compte que tu souhaites modifier ci-dessous :'
                )],
                components: [row]
            });
            console.log('[DEBUG] Menu de sélection envoyé');

            // Attendre la sélection
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000
            });

            collector.on('collect', async i => {
                console.log(`[DEBUG] Interaction select reçue: ${i.customId}`);
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: 'Ce menu n\'est pas pour toi.', ephemeral: true });
                }

                const selectedHandle = i.values[0];
                console.log(`[DEBUG] Handle sélectionné: ${selectedHandle}`);

                const accountToEdit = accounts.find(acc => acc.handle === selectedHandle);

                if (!accountToEdit) {
                    console.log('[DEBUG] Compte introuvable dans la liste locale');
                    return i.reply({ content: 'Compte introuvable.', ephemeral: true });
                }

                // Créer le modal
                const modal = new ModalBuilder()
                    .setCustomId(`edit_account_modal_${Date.now()}`)
                    .setTitle('Modifier le compte');

                const platformInput = new TextInputBuilder()
                    .setCustomId('platform')
                    .setLabel('Plateforme')
                    .setValue(accountToEdit.platform)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const handleInput = new TextInputBuilder()
                    .setCustomId('handle')
                    .setLabel('@ ou Username')
                    .setValue(accountToEdit.handle)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const linkInput = new TextInputBuilder()
                    .setCustomId('profileLink')
                    .setLabel('Lien du profil')
                    .setValue(accountToEdit.profileLink || '')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const followersInput = new TextInputBuilder()
                    .setCustomId('followers')
                    .setLabel('Nombre de Followers')
                    .setValue(accountToEdit.followers ? accountToEdit.followers.toString() : '0')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(platformInput),
                    new ActionRowBuilder().addComponents(handleInput),
                    new ActionRowBuilder().addComponents(linkInput),
                    new ActionRowBuilder().addComponents(followersInput)
                );

                console.log('[DEBUG] Affichage du modal...');
                await i.showModal(modal);

                // Attendre la soumission du modal
                console.log('[DEBUG] Attente soumission modal...');
                const submitted = await i.awaitModalSubmit({
                    time: 300000,
                    filter: (sub) => sub.user.id === interaction.user.id
                }).catch(err => {
                    console.error('[DEBUG] Erreur awaitModalSubmit:', err);
                    return null;
                });

                if (submitted) {
                    console.log('[DEBUG] Modal soumis !');
                    const newPlatform = submitted.fields.getTextInputValue('platform');
                    const newHandle = submitted.fields.getTextInputValue('handle');
                    const newLink = submitted.fields.getTextInputValue('profileLink');
                    const newFollowersStr = submitted.fields.getTextInputValue('followers');

                    let newFollowers = 0;
                    if (newFollowersStr) {
                        const parsed = parseInt(newFollowersStr.replace(/\s/g, ''));
                        if (!isNaN(parsed)) newFollowers = parsed;
                    }

                    // Mettre à jour la DB
                    console.log('[DEBUG] Appel updateSocialAccount...');
                    const updated = database.updateSocialAccount(
                        interaction.user.id,
                        selectedHandle, // L'ancien handle pour trouver le compte
                        newPlatform,
                        newHandle,
                        newLink,
                        newFollowers
                    );
                    console.log(`[DEBUG] Résultat update: ${updated ? 'OK' : 'FAIL'}`);

                    if (updated) {
                        await submitted.reply({
                            embeds: [embeds.success(
                                'Compte modifié !',
                                `✅ Tes modifications ont été enregistrées.\n\n` +
                                `**${newPlatform}** - ${newHandle}\n` +
                                `🔗 ${newLink}\n` +
                                `👥 ${newFollowers.toLocaleString()} followers`
                            )],
                            ephemeral: true
                        });
                        console.log('[DEBUG] Réponse envoyée au user');

                        // Notifier les admins via le système centralisé (Backup inclus)
                        const notifications = require('../utils/notifications');
                        const oldAccount = { ...accountToEdit, handle: selectedHandle }; // Snapshot old state
                        const newAccount = { platform: newPlatform, handle: newHandle, profileLink: newLink, followers: newFollowers };

                        await notifications.notifyAccountEdit(submitted.guild, interaction.user, oldAccount, newAccount);
                        console.log('[DEBUG] Notif admin envoyée via notifications.js');

                    } else {
                        console.log('[DEBUG] Update a retourné false/null');
                        await submitted.reply({
                            content: 'Erreur lors de la mise à jour (compte non trouvé ou erreur DB).',
                            ephemeral: true
                        });
                    }
                } else {
                    console.log('[DEBUG] Modal non soumis (timeout ou null)');
                }
            });

            collector.on('end', collected => {
                console.log(`[DEBUG] Collector terminé. Items collectés: ${collected.size}`);
            });

        } catch (error) {
            console.error('[DEBUG] Erreur globale edit-account:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
            }
        }
    }
};
