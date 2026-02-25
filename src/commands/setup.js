const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../config');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('🔧 Configuration du serveur Farmer League (ADMIN)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName('wipe')
                .setDescription('⚠️ EFFACER TOUT le serveur avant le setup ? (Action irréversible)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        const nuke = interaction.options.getBoolean('wipe') || false;

        try {
            const guild = interaction.guild;

            // ÉTAPE 0: NETTOYAGE (Seulement si wipe: true)
            if (nuke) {
                await interaction.editReply('🗑️ **NETTOYAGE complet en cours...**');

                // Supprimer canaux
                const channelsToDelete = guild.channels.cache.filter(ch => ch.deletable);
                for (const channel of channelsToDelete.values()) {
                    try { await channel.delete(); } catch (err) { }
                }

                // Supprimer rôles
                const rolesToDelete = guild.roles.cache.filter(role =>
                    role.editable && !role.managed && role.id !== guild.id
                );
                for (const role of rolesToDelete.values()) {
                    try { await role.delete(); } catch (err) { }
                }
            } else {
                await interaction.editReply('🛡️ **MODE SÉCURISÉ : Mise à jour de la structure existante...**\n*Tes données et candidatures en base sont en sécurité.*');
            }

            // ÉTAPE 1: Gérer les rôles (Idempotent)
            const roles = {};
            for (const [key, roleData] of Object.entries(config.roles)) {
                let existingRole = guild.roles.cache.find(r => r.name === roleData.name);
                if (!existingRole) {
                    roles[key] = await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        reason: 'Farmer League Bot Setup'
                    });
                } else {
                    roles[key] = existingRole;
                }
            }

            // ÉTAPE 2: Gérer les catégories et canaux (Idempotent)
            const categories = {};

            const getOrCreateCategory = async (name, parentId, overwrites = []) => {
                let cat = guild.channels.cache.find(ch => ch.name === name && ch.type === ChannelType.GuildCategory);
                if (!cat) {
                    cat = await guild.channels.create({ name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites });
                }
                return cat;
            };

            const getOrCreateChannel = async (name, type, parent, overwrites = []) => {
                let chan = guild.channels.cache.find(ch => ch.name === name && ch.parentId === parent?.id);
                if (!chan) {
                    chan = await guild.channels.create({ name, type, parent, permissionOverwrites: overwrites });
                }
                return chan;
            };

            // Catégorie BIENVENUE
            categories.welcome = await getOrCreateCategory(config.channels.categories.welcome);
            for (const channelData of config.channels.welcome) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.welcome);
            }

            // Catégorie CROISSANCE
            categories.growth = await getOrCreateCategory(config.channels.categories.growth);
            for (const channelData of config.channels.growth) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.growth);
            }

            // Catégorie ENTRAÎNEMENT
            const trainingOverwrites = [
                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                { id: roles.rookie.id, allow: [PermissionFlagsBits.ViewChannel] },
                { id: roles.hustler.id, allow: [PermissionFlagsBits.ViewChannel] },
                { id: roles.grinder.id, allow: [PermissionFlagsBits.ViewChannel] },
                { id: roles.elite.id, allow: [PermissionFlagsBits.ViewChannel] }
            ];
            categories.training = await getOrCreateCategory(config.channels.categories.training, null, trainingOverwrites);
            for (const channelData of config.channels.training) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.training, trainingOverwrites);
            }

            // Catégorie PRODUCTION
            const productionOverwrites = trainingOverwrites; // Même accès
            categories.production = await getOrCreateCategory(config.channels.categories.production, null, productionOverwrites);
            for (const channelData of config.channels.production) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.production, productionOverwrites);
            }

            // Catégorie RÉMUNÉRATION
            categories.money = await getOrCreateCategory(config.channels.categories.money, null, trainingOverwrites);
            for (const channelData of config.channels.money) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.money, trainingOverwrites);
            }

            // Catégorie ELITE
            const eliteOverwrites = [
                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                { id: roles.elite.id, allow: [PermissionFlagsBits.ViewChannel] }
            ];
            categories.elite = await getOrCreateCategory(config.channels.categories.elite, null, eliteOverwrites);
            for (const channelData of config.channels.elite) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.elite, eliteOverwrites);
            }

            // Catégorie MANAGEMENT
            const adminOverwrites = [
                { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                { id: roles.admin.id, allow: [PermissionFlagsBits.ViewChannel] },
                { id: roles.moderator.id, allow: [PermissionFlagsBits.ViewChannel] }
            ];
            categories.management = await getOrCreateCategory(config.channels.categories.management, null, adminOverwrites);
            for (const channelData of config.channels.management) {
                await getOrCreateChannel(channelData.name, ChannelType.GuildText, categories.management, adminOverwrites);
            }

            // Catégorie TICKETS (candidatures - canaux créés dynamiquement)
            if (config.channels.categories.tickets) {
                categories.tickets = await getOrCreateCategory(config.channels.categories.tickets);
            }

            console.log('✅ Toutes les catégories et canaux créés!');

            // ÉTAPE 3: Remplir les canaux principaux avec messages de bienvenue
            await interaction.editReply('⏳ **Remplissage des canaux avec messages de bienvenue...**');

            const welcomeChannel = guild.channels.cache.find(ch => ch.name.includes('accueil'));
            if (welcomeChannel) {
                await welcomeChannel.send({
                    embeds: [embeds.welcome()]
                });
            }

            const visionChannel = guild.channels.cache.find(ch => ch.name.includes('notre-vision'));
            if (visionChannel) {
                const { EmbedBuilder } = require('discord.js');
                await visionChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('🌾 Notre Vision - Farmer League')
                        .setDescription(
                            '**Farmer League, c\'est quoi ?**\n\n' +
                            'On construit ensemble la **première équipe structurée de farmers vidéo pro**.\n\n' +
                            '**Notre modèle unique:**\n' +
                            '1. **Entraide Collective**: On s\'entraide pour trouver les meilleurs "Hooks" (accroches) qui font exploser les vues.\n' +
                            '2. **L\'Affiliation (Ton Salaire)**: Pas de micro-paiements par mission. On se concentre sur le modèle d\'affiliation **200€ les 1000 clics** via tes liens Tap.it.\n' +
                            '3. **Progression**: Plus tu participes aux analyses de hooks, plus tu gagnes de points et montes en grade (Rookie → Elite).\n\n' +
                            '**Pourquoi nous rejoindre ?**\n' +
                            '✅ Apprendre les secrets de la viralité avec des experts.\n' +
                            '✅ Badge "Founding Member" pour les premiers.\n' +
                            '✅ Maximiser tes revenus d\'affiliation grâce aux conseils de la league.\n\n' +
                            '**Tu es un pionnier. Ton talent est ton seul levier.** 🚀'
                        )
                        .setFooter({ text: 'Farmer League - On grandit ensemble' })
                    ]
                });
            }

            const howItWorksChannel = guild.channels.cache.find(ch => ch.name.includes('comment-ça-marche'));
            if (howItWorksChannel) {
                const { EmbedBuilder } = require('discord.js');
                await howItWorksChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📜 Comment ça marche ?')
                        .setDescription(
                            '**Système de progression & Revenus**\n\n' +
                            '**💰 Tes Revenus (Affiliation)**\n' +
                            '• Seule source de gains: Tes liens Tap.it.\n' +
                            '• Commission: **200€ / 1000 clics**.\n' +
                            '• Retrait min: 50€.\n\n' +
                            '**🥉 Rookie (0-500 pts)**\n' +
                            '• Accès aux missions de base (Hook Training).\n\n' +
                            '**🥈 Hustler (501-2000 pts)**\n' +
                            '• Accès aux analyses de hooks avancées.\n\n' +
                            '**🥇 Grinder (2001-5000 pts)**\n' +
                            '• Mentorat des nouveaux membres.\n\n' +
                            '**💎 Elite (5001+ pts)**\n' +
                            '• Salon VIP & Partage de stratégies confidentielles.\n\n' +
                            '**Comment gagner des points ?**\n' +
                            '• Participer aux missions de recherche de Hooks.\n' +
                            '• Partager tes analyses avec les autres.\n' +
                            '• Aider la communauté à grandir.\n\n' +
                            '**Commandes utiles:**\n' +
                            '**Postuler** (bouton dans #accueil)\n' +
                            '`/stats` - Voir ta progression\n' +
                            '`/pay view` - Voir tes gains d\'affiliation\n'
                        )
                        .setFooter({ text: 'La progression, c\'est la clé' })
                    ]
                });
            }

            const roadmapChannel = guild.channels.cache.find(ch => ch.name.includes('roadmap'));
            if (roadmapChannel) {
                const { EmbedBuilder } = require('discord.js');
                await roadmapChannel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setTitle('📊 Roadmap Farmer League')
                        .setDescription(
                            '**Objectifs de la structure**\n\n' +
                            '**Phase 1 - Domination du Hook** ✅ EN COURS\n' +
                            '• Optimiser nos accroches pour maximiser les clics Tap.it.\n' +
                            '• Créer une base de données des hooks les plus viraux.\n\n' +
                            '**Phase 2 - Scaling Affiliation** 🔄 BIENTÔT\n' +
                            '• Partager des templates et assets exclusifs pour booster ton farming.\n\n' +
                            '**Phase 3 - Elite Squad** 🎯 OBJECTIF\n' +
                            '• Créer un groupe de monteurs capables de générer des millions de clics par mois.\n\n' +
                            '*Dernière update: ' + new Date().toLocaleDateString('fr-FR') + '*'
                        )
                        .setFooter({ text: 'On grandit ensemble, en transparence totale' })
                    ]
                });
            }

            const challengesChannel = guild.channels.cache.find(ch => ch.name.includes('défis-hebdomadaires'));
            if (challengesChannel) {
                await challengesChannel.send(
                    '**🎯 Missions de Hook (Practice)**\n\n' +
                    'C\'est ici qu\'on poste les missions pour trouver le meilleur hook !\n\n' +
                    '**Format:**\n' +
                    '• Niche ciblée\n' +
                    '• Analyse du potentiel\n' +
                    '• Points à gagner\n\n' +
                    '**Sois prêt à farmer la viralité !** 🚀'
                );
            }

            console.log('✅ Canaux principaux remplis avec messages de bienvenue');


            // Message final
            await interaction.editReply({
                content: null,
                embeds: [embeds.success(
                    'Setup Farmer League complet!',
                    '## 🌾 Serveur Farmer League créé avec succès!\n\n' +
                    `🗑️ **${deletedChannels} anciens canaux supprimés**\n` +
                    `🗑️ **${deletedRoles} anciens rôles supprimés**\n` +
                    '✅ **8 nouveaux rôles créés** (dont Founding Member)\n' +
                    '✅ **35+ canaux créés** en 7 catégories\n' +
                    '✅ **Permissions configurées** automatiquement\n\n' +
                    '**🎉 Farmer League est prêt !**\n\n' +
                    '**Prochaines étapes:**\n' +
                    '1. Lance le 1er défi hebdo dans #défis-hebdomadaires\n' +
                    '2. Update #roadmap-farmer-league régulièrement\n' +
                    '3. Recrute avec les messages d\'acquisition fournis\n' +
                    '4. Créé du contenu pour attirer les pionniers\n\n' +
                    "**Let's grow ensemble! 🚀**"
                )]
            });

            console.log('\n✅ Setup Farmer League terminé avec succès!\n');

        } catch (error) {
            console.error('❌ Erreur lors du setup:', error);
            await interaction.editReply({
                embeds: [embeds.error(
                    'Erreur de setup',
                    'Une erreur est survenue. Vérifie que le bot a les permissions "Administrator".'
                )]
            });
        }
    }
};
