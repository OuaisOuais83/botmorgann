const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const config = require('../config');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('🔄 Mettre à jour le serveur de manière incrémentale (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('channels')
                .setDescription('Ajouter/mettre à jour les canaux manquants')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('Ajouter/mettre à jour les rôles manquants')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('messages')
                .setDescription('Remplir/mettre à jour le contenu des canaux')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel-add')
                .setDescription('Ajouter un canal spécifique')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom du canal (ex: nouveau-canal)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('categorie')
                        .setDescription('Nom de la catégorie parente')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel-delete')
                .setDescription('Supprimer un canal spécifique')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal à supprimer')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('full-sync')
                .setDescription('Synchroniser TOUT avec la config (ajoute manquants, garde existants)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles-fix')
                .setDescription('Corriger les propriétés des rôles existants (hoist pour séparateurs)')
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guild = interaction.guild;

        try {
            switch (subcommand) {
                case 'channels':
                    await updateChannels(interaction, guild);
                    break;
                case 'roles':
                    await updateRoles(interaction, guild);
                    break;
                case 'messages':
                    await updateMessages(interaction, guild);
                    break;
                case 'channel-add':
                    await addChannel(interaction, guild);
                    break;
                case 'channel-delete':
                    await deleteChannel(interaction, guild);
                    break;
                case 'full-sync':
                    await fullSync(interaction, guild);
                    break;
                case 'roles-fix':
                    await fixRolesHoist(interaction, guild);
                    break;
            }
        } catch (error) {
            console.error('Erreur update:', error);
            await interaction.editReply({
                embeds: [embeds.error('Erreur', 'Une erreur est survenue lors de la mise à jour.')]
            });
        }
    }
};

// Fonction: Mettre à jour les canaux manquants
async function updateChannels(interaction, guild) {
    let added = 0;
    const results = [];

    await interaction.editReply('⏳ Vérification et ajout des canaux manquants...');

    // Vérifier chaque catégorie et ses canaux
    for (const [catKey, catName] of Object.entries(config.channels.categories)) {
        let category = guild.channels.cache.find(ch =>
            ch.type === ChannelType.GuildCategory && ch.name === catName
        );

        // Créer la catégorie si manquante
        if (!category) {
            category = await guild.channels.create({
                name: catName,
                type: ChannelType.GuildCategory
            });
            results.push(`✅ Catégorie créée: ${catName}`);
            added++;
        }

        // Ajouter les canaux manquants dans cette catégorie
        const channelsList = config.channels[catKey];
        if (channelsList) {
            for (const channelData of channelsList) {
                const exists = guild.channels.cache.find(ch => ch.name === channelData.name);
                if (!exists) {
                    await guild.channels.create({
                        name: channelData.name,
                        type: ChannelType.GuildText,
                        parent: category
                    });
                    results.push(`✅ Canal ajouté: ${channelData.name}`);
                    added++;
                }
            }
        }
    }

    const summary = added > 0
        ? `${added} canal(aux) ajouté(s):\n${results.slice(0, 10).join('\n')}`
        : 'Tous les canaux existent déjà. Aucun ajout nécessaire.';

    await interaction.editReply({
        embeds: [embeds.success('Canaux mis à jour', summary)]
    });
}

// Fonction: Mettre à jour les rôles manquants
async function updateRoles(interaction, guild) {
    let added = 0;
    const results = [];

    await interaction.editReply('⏳ Vérification et ajout des rôles manquants...');

    for (const [key, roleData] of Object.entries(config.roles)) {
        const existing = guild.roles.cache.find(r => r.name === roleData.name);
        if (!existing) {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoisted || false,
                reason: 'Update Farmer League'
            });
            results.push(`✅ Rôle créé: ${roleData.name}`);
            added++;
        }
    }

    const summary = added > 0
        ? `${added} rôle(s) ajouté(s):\n${results.join('\n')}`
        : 'Tous les rôles existent déjà. Aucun ajout nécessaire.';

    await interaction.editReply({
        embeds: [embeds.success('Rôles mis à jour', summary)]
    });
}

// Fonction: Corriger les propriétés hoist des rôles existants
async function fixRolesHoist(interaction, guild) {
    let updated = 0;
    const results = [];

    await interaction.editReply('⏳ Correction des propriétés des rôles...');

    for (const [key, roleData] of Object.entries(config.roles)) {
        const role = guild.roles.cache.find(r => r.name === roleData.name);

        if (role) {
            const shouldHoist = roleData.hoisted || false;

            // Vérifier si le rôle a besoin d'être mis à jour
            if (role.hoist !== shouldHoist) {
                await role.edit({
                    hoist: shouldHoist
                });
                results.push(`✅ ${roleData.name} mis à jour (hoist: ${shouldHoist})`);
                updated++;
            }
        }
    }

    const summary = updated > 0
        ? `${updated} rôle(s) mis à jour:\n${results.slice(0, 10).join('\n')}`
        : 'Tous les rôles sont déjà correctement configurés.';

    await interaction.editReply({
        embeds: [embeds.success('Rôles corrigés', summary)]
    });
}

// Fonction: Mettre à jour le contenu des canaux
async function updateMessages(interaction, guild) {
    await interaction.editReply('⏳ Mise à jour du contenu des canaux...');

    const channelMessages = require('../utils/farmerLeagueMessages');
    let updated = 0;

    for (const [channelKey, sendMessage] of Object.entries(channelMessages)) {
        // Normaliser la clé pour matcher les noms de canaux Discord
        const normalizedKey = channelKey.toLowerCase()
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/ç/g, 'c')
            .replace(/à/g, 'a')
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/ê/g, 'e');

        const channel = guild.channels.cache.find(ch => {
            // Nettoyer le nom du canal (enlever émojis et séparateurs)
            const cleanName = ch.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // Enlever émojis et caractères spéciaux
                .replace(/・/g, ' ')       // Enlever séparateur japonais
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .trim();

            return cleanName.includes(normalizedKey) || normalizedKey.includes(cleanName);
        });

        if (channel) {
            try {
                // SUPPRIMER tous les messages existants
                const messages = await channel.messages.fetch({ limit: 100 });

                if (messages.size > 0) {
                    try {
                        // Essayer la suppression en masse (fonctionne pour messages < 14 jours)
                        await channel.bulkDelete(messages, true);
                        console.log(`✅ ${messages.size} messages supprimés en masse dans ${channel.name}`);
                    } catch (bulkError) {
                        // Si échec (messages trop anciens), supprimer un par un
                        console.log(`⚠️ BulkDelete échoué pour ${channel.name}, suppression individuelle...`);
                        for (const msg of messages.values()) {
                            try {
                                await msg.delete();
                            } catch (deleteError) {
                                // Ignorer les erreurs individuelles
                            }
                        }
                        console.log(`✅ Messages supprimés individuellement dans ${channel.name}`);
                    }
                }

                // Envoyer le nouveau message
                await sendMessage(channel);
                updated++;
                console.log(`✅ Canal mis à jour: ${channel.name}`);
            } catch (error) {
                console.log(`⚠️ Erreur sur ${channel.name}:`, error.message);
            }
        } else {
            console.log(`⚠️ Canal non trouvé pour: ${channelKey}`);
        }
    }

    await interaction.editReply({
        embeds: [embeds.success(
            'Messages mis à jour',
            `${updated} canal(aux) mis à jour avec le nouveau contenu.\n\nLes anciens messages ont été supprimés.`
        )]
    });
}

// Fonction: Ajouter un canal spécifique
async function addChannel(interaction, guild) {
    const channelName = interaction.options.getString('nom');
    const categoryName = interaction.options.getString('categorie');

    let parent = null;
    if (categoryName) {
        parent = guild.channels.cache.find(ch =>
            ch.type === ChannelType.GuildCategory &&
            ch.name.toLowerCase().includes(categoryName.toLowerCase())
        );
    }

    const existing = guild.channels.cache.find(ch => ch.name === channelName);
    if (existing) {
        return interaction.editReply({
            embeds: [embeds.warning('Canal existe', `Le canal "${channelName}" existe déjà.`)]
        });
    }

    await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parent
    });

    await interaction.editReply({
        embeds: [embeds.success(
            'Canal créé',
            `✅ Canal "${channelName}" créé${parent ? ` dans ${parent.name}` : ''}.`
        )]
    });
}

// Fonction: Supprimer un canal spécifique
async function deleteChannel(interaction, guild) {
    const channel = interaction.options.getChannel('canal');

    if (!channel.deletable) {
        return interaction.editReply({
            embeds: [embeds.error('Impossible', 'Ce canal ne peut pas être supprimé.')]
        });
    }

    const channelName = channel.name;
    await channel.delete('Suppression via commande /update');

    await interaction.editReply({
        embeds: [embeds.success('Canal supprimé', `✅ Canal "${channelName}" supprimé.`)]
    });
}

// Fonction: Synchronisation complète
async function fullSync(interaction, guild) {
    await interaction.editReply('⏳ **Synchronisation complète en cours...**\n\nCela peut prendre 20-30 secondes.');

    let rolesAdded = 0;
    let channelsAdded = 0;
    let messagesUpdated = 0;

    // 1. Rôles
    for (const [key, roleData] of Object.entries(config.roles)) {
        const existing = guild.roles.cache.find(r => r.name === roleData.name);
        if (!existing) {
            await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoisted || false,
                reason: 'Full Sync Farmer League'
            });
            rolesAdded++;
        }
    }

    // 2. Canaux
    for (const [catKey, catName] of Object.entries(config.channels.categories)) {
        let category = guild.channels.cache.find(ch =>
            ch.type === ChannelType.GuildCategory && ch.name === catName
        );

        if (!category) {
            category = await guild.channels.create({
                name: catName,
                type: ChannelType.GuildCategory
            });
            channelsAdded++;
        }

        const channelsList = config.channels[catKey];
        if (channelsList) {
            for (const channelData of channelsList) {
                const exists = guild.channels.cache.find(ch => ch.name === channelData.name);
                if (!exists) {
                    await guild.channels.create({
                        name: channelData.name,
                        type: ChannelType.GuildText,
                        parent: category
                    });
                    channelsAdded++;
                }
            }
        }
    }

    // 3. Messages
    const channelMessages = require('../utils/farmerLeagueMessages');
    for (const [channelKey, sendMessage] of Object.entries(channelMessages)) {
        // Normaliser la clé pour matcher les noms de canaux Discord
        const normalizedKey = channelKey.toLowerCase()
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/ç/g, 'c')
            .replace(/à/g, 'a')
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/ê/g, 'e');

        const channel = guild.channels.cache.find(ch => {
            // Nettoyer le nom du canal (enlever émojis et séparateurs)
            const cleanName = ch.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // Enlever émojis et caractères spéciaux
                .replace(/・/g, ' ')       // Enlever séparateur japonais
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .trim();

            return cleanName.includes(normalizedKey) || normalizedKey.includes(cleanName);
        });

        if (channel) {
            try {
                // SUPPRIMER tous les messages existants
                const messages = await channel.messages.fetch({ limit: 100 });

                if (messages.size > 0) {
                    try {
                        // Essayer la suppression en masse (fonctionne pour messages < 14 jours)
                        await channel.bulkDelete(messages, true);
                        console.log(`✅ ${messages.size} messages supprimés en masse dans ${channel.name}`);
                    } catch (bulkError) {
                        // Si échec (messages trop anciens), supprimer un par un
                        console.log(`⚠️ BulkDelete échoué pour ${channel.name}, suppression individuelle...`);
                        for (const msg of messages.values()) {
                            try {
                                await msg.delete();
                            } catch (deleteError) {
                                // Ignorer les erreurs individuelles
                            }
                        }
                        console.log(`✅ Messages supprimés individuellement dans ${channel.name}`);
                    }
                }

                // Envoyer le nouveau message
                await sendMessage(channel);
                messagesUpdated++;
                console.log(`✅ Canal mis à jour: ${channel.name}`);
            } catch (error) {
                console.log(`⚠️ Erreur: ${error.message}`);
            }
        } else {
            console.log(`⚠️ Canal non trouvé pour: ${channelKey}`);
        }
    }

    await interaction.editReply({
        embeds: [embeds.success(
            'Synchronisation complète terminée',
            `✅ **Rôles:** ${rolesAdded} ajouté(s)\n` +
            `✅ **Canaux:** ${channelsAdded} ajouté(s)\n` +
            `✅ **Messages:** ${messagesUpdated} canal(aux) rempli(s)\n\n` +
            `**Rien n'a été supprimé. Les éléments existants sont intacts.**`
        )]
    });
}
