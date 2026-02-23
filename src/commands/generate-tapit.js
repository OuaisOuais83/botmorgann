const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('generate-tapit')
        .setDescription('🔗 [ADMIN] Assigner un lien Dub.co (Tap.it) via menu déroulant')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Monteur à qui assigner le lien')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tapit_link')
                .setDescription('Le lien Dub.co complet (ex: https://mushwayxfarmerleague.com/...)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const tapitLink = interaction.options.getString('tapit_link').trim();

            // 1. Récupérer les comptes
            const accounts = await database.getSocialAccounts(targetUser.id);

            if (!accounts || accounts.length === 0) {
                return interaction.reply({
                    embeds: [embeds.error(
                        'Aucun compte trouvé',
                        `${targetUser} n'a déclaré aucun compte social.\n` +
                        `Demande-lui de faire \`/add-account\` d'abord.`
                    )],
                    ephemeral: true
                });
            }

            // 2. Créer le Menu Déroulant (Dropdown)
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_accounts')
                .setPlaceholder('Choisir les comptes à lier (Multisélection possible)')
                .setMinValues(1)
                .setMaxValues(accounts.length) // Permet de tout sélectionner d'un coup
                .addOptions(
                    accounts.map(acc =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`${acc.platform} - ${acc.handle}`)
                            .setDescription(`Actuellement: ${acc.tapitLink || 'Aucun lien'}`)
                            .setValue(`${acc.platform}|${acc.handle}`) // On passe les 2 infos dans la value
                    )
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.reply({
                content: `🔗 **Configuration du lien pour ${targetUser}**\nLien à assigner : \`${tapitLink}\`\nSélectionne les comptes concernés ci-dessous :`,
                components: [row],
                ephemeral: true
            });

            // 3. Créer un Collector pour attendre la réponse
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000 // 60 secondes pour choisir
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: 'Pas touche !', ephemeral: true });
                }

                const selectedValues = i.values; // Array des valeurs "platform|handle"
                let updatedCount = 0;

                // 4. Mettre à jour la DB pour chaque compte sélectionné
                for (const value of selectedValues) {
                    const [platform, handle] = value.split('|');
                    const success = await database.updateTapitLink(targetUser.id, platform, handle, tapitLink);
                    if (success) updatedCount++;
                }

                // 5. Feedback final
                await i.update({
                    content: `✅ **Succès !** Lien \`${tapitLink}\` assigné à **${updatedCount}** compte(s) pour ${targetUser}.`,
                    components: [], // On retire le menu
                    embeds: []
                });

                // 6. Notifier le monteur (Une seule fois, récapitulatif)
                try {
                    const member = await interaction.guild.members.fetch(targetUser.id);
                    await member.send({
                        embeds: [embeds.success(
                            '🎉 Ton lien d\'affiliation est prêt !',
                            `**Lien unique :**\n${tapitLink}\n\n` +
                            `**Assigné à tes comptes :**\n` +
                            selectedValues.map(v => `• ${v.split('|')[0]} (${v.split('|')[1]})`).join('\n') + `\n\n` +
                            `➡️ **Action requise :** Ajoute ce lien en bio de TOUS ces comptes.\n` +
                            `Let's farm! 🌾`
                        )]
                    });
                } catch (err) {
                    console.log(`Impossible de DM ${targetUser.tag}`);
                }

                // 7. Notifier dans les logs publics
                const trackingChannel = interaction.guild.channels.cache.find(c => c.name === 'tracking-comptes');
                if (trackingChannel) {
                    await trackingChannel.send({
                        embeds: [embeds.success(
                            '🔗 Lien(s) Assigné(s)',
                            `**Monteur:** ${targetUser}\n**Lien:** ${tapitLink}\n**Comptes:**\n${selectedValues.map(v => `- ${v.split('|')[0]}`).join('\n')}\n**Admin:** ${interaction.user}`
                        )]
                    });
                }

                collector.stop();
            });

        } catch (error) {
            console.error('Erreur generate-tapit:', error);
            if (interaction.replied) {
                await interaction.editReply({ content: '❌ Erreur interne.', components: [] });
            } else {
                await interaction.reply({ content: '❌ Erreur interne.', ephemeral: true });
            }
        }
    }
};
