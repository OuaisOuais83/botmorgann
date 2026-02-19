const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-voice')
        .setDescription('Créer les canaux vocaux Farmer League')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // Récupérer les rôles
            const adminRole = guild.roles.cache.find(r => r.name === '👑 Admin Farmer League');
            const modRole = guild.roles.cache.find(r => r.name === '🛡️ Modérateur');
            const rookieRole = guild.roles.cache.find(r => r.name === '🥉 Rookie');
            const hustlerRole = guild.roles.cache.find(r => r.name === '🥈 Hustler');
            const grinderRole = guild.roles.cache.find(r => r.name === '🥇 Grinder');
            const eliteRole = guild.roles.cache.find(r => r.name === '💎 Elite');

            // Vérifier si la catégorie existe
            let voiceCategory = guild.channels.cache.find(
                c => c.type === ChannelType.GuildCategory && c.name === '🎙️ SALONS VOCAUX'
            );

            // Créer la catégorie si elle n'existe pas
            if (!voiceCategory) {
                voiceCategory = await guild.channels.create({
                    name: '🎙️ SALONS VOCAUX',
                    type: ChannelType.GuildCategory,
                    position: 10
                });
            }

            const createdChannels = [];

            // 1. Bureau Admin (Admins seulement)
            const bureauAdmin = await guild.channels.create({
                name: '🏢 Bureau Admin',
                type: ChannelType.GuildVoice,
                parent: voiceCategory.id,
                userLimit: 5,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                    },
                    {
                        id: adminRole?.id || interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.Stream,
                            PermissionFlagsBits.UseVAD
                        ]
                    }
                ]
            });
            createdChannels.push('🏢 Bureau Admin');

            // 2. Réunion (Rookie et au-dessus)
            const permissionsReunion = [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionFlagsBits.Connect]
                }
            ];

            // Ajouter permissions pour chaque rôle monteur
            const monteurRoles = [adminRole, modRole, rookieRole, hustlerRole, grinderRole, eliteRole].filter(r => r);
            monteurRoles.forEach(role => {
                permissionsReunion.push({
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.Stream,
                        PermissionFlagsBits.UseVAD
                    ]
                });
            });

            const reunion = await guild.channels.create({
                name: '📞 Réunion',
                type: ChannelType.GuildVoice,
                parent: voiceCategory.id,
                userLimit: 25,
                permissionOverwrites: permissionsReunion
            });
            createdChannels.push('📞 Réunion');

            // 3. Salon Communautaire (Tout le monde)
            const salonCommunautaire = await guild.channels.create({
                name: '💬 Salon Communautaire',
                type: ChannelType.GuildVoice,
                parent: voiceCategory.id,
                userLimit: 0, // Illimité
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.Stream,
                            PermissionFlagsBits.UseVAD
                        ]
                    }
                ]
            });
            createdChannels.push('💬 Salon Communautaire');

            await interaction.editReply({
                content: `✅ **Salons vocaux créés avec succès !**\n\n${createdChannels.map(c => `✅ ${c}`).join('\n')}\n\n**Catégorie :** 🎙️ SALONS VOCAUX\n\n**Permissions configurées :**\n🏢 Bureau Admin → Admins uniquement\n📞 Réunion → Rookie et au-dessus\n💬 Salon Communautaire → Tout le monde`
            });

        } catch (error) {
            console.error('Erreur lors de la création des salons vocaux:', error);
            await interaction.editReply({
                content: `❌ Erreur lors de la création des salons vocaux: ${error.message}`
            });
        }
    }
};
