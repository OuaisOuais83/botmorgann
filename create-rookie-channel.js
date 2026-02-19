require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté: ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('❌ Aucun serveur trouvé !');
        process.exit(1);
    }

    console.log(`📊 Serveur: ${guild.name}`);

    try {
        // Trouver la catégorie FARMING
        const farmingCategory = guild.channels.cache.find(c =>
            c.type === ChannelType.GuildCategory &&
            c.name.toLowerCase().includes('farming')
        );

        if (!farmingCategory) {
            console.error('❌ Catégorie FARMING non trouvée !');
            console.log('📋 Catégories disponibles:');
            guild.channels.cache
                .filter(c => c.type === ChannelType.GuildCategory)
                .forEach(c => console.log(`   - ${c.name}`));
            process.exit(1);
        }

        console.log(`✅ Catégorie trouvée: ${farmingCategory.name}`);

        // Trouver le rôle Rookie
        const rookieRole = guild.roles.cache.find(r => r.name.includes('Rookie') || r.name.includes('🥉'));

        if (!rookieRole) {
            console.error('❌ Rôle Rookie non trouvé !');
            process.exit(1);
        }

        console.log(`✅ Rôle trouvé: ${rookieRole.name}`);

        // Vérifier si le canal existe déjà
        const existingChannel = guild.channels.cache.find(c =>
            c.name.includes('rookie') && c.name.includes('discussion') && c.parentId === farmingCategory.id
        );

        if (existingChannel) {
            console.log(`ℹ️ Le canal existe déjà: ${existingChannel.name}`);
            console.log(`🔗 URL: https://discord.com/channels/${guild.id}/${existingChannel.id}`);

            // Poster le message dans le canal existant
            console.log('📝 Envoi du message dans le canal existant...');
            const message = await existingChannel.send({
                content: `${rookieRole}`,
                embeds: [{
                    color: 0x00FF00,
                    title: '🎉 CANDIDATURE RETENUE',
                    description:
                        `**Félicitations !**\n\n` +
                        `Si tu reçois ce message, c'est que **ta candidature a été retenue** pour rejoindre Farmer League ! 🌾\n\n` +
                        `────────────────────────\n\n` +
                        `**📅 PROCHAINE ÉTAPE : RÉUNION DE LANCEMENT**\n\n` +
                        `Une réunion est prévue prochainement pour :\n` +
                        `• Te présenter le système en détail\n` +
                        `• Répondre à tes questions\n` +
                        `• T'attribuer ton lien de tracking\n\n` +
                        `────────────────────────\n\n` +
                        `**✅ SI TU SERAS PRÉSENT :**\n` +
                        `Réagis à ce message avec ✅\n\n` +
                        `**❌ SI TU SERAS ABSENT :**\n` +
                        `Envoie un DM à un admin pour obtenir le compte rendu de la réunion\n\n` +
                        `────────────────────────\n\n` +
                        `**Bienvenue dans la League ! 🚀**`,
                    timestamp: new Date(),
                    footer: {
                        text: 'Farmer League'
                    }
                }]
            });

            await message.react('✅');
            await message.react('❌');

            console.log('✅ Message envoyé avec succès !');
            console.log(`🔗 Lien du message: ${message.url}`);
            process.exit(0);
        }

        // Créer le canal pour les Rookies
        console.log('🆕 Création du canal...');

        const rookieChannel = await guild.channels.create({
            name: '💬・rookie-discussion',
            type: ChannelType.GuildText,
            parent: farmingCategory.id,
            topic: 'Canal de discussion pour les nouveaux Rookies - Posez vos questions et échangez !',
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: rookieRole.id, // Rookies
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AddReactions
                    ]
                }
            ]
        });

        console.log(`✅ Canal créé: ${rookieChannel.name}`);
        console.log(`🔗 URL: https://discord.com/channels/${guild.id}/${rookieChannel.id}`);

        // Poster le message d'annonce
        console.log('📝 Envoi du message d\'annonce...');

        const message = await rookieChannel.send({
            content: `${rookieRole}`,
            embeds: [{
                color: 0x00FF00,
                title: '🎉 CANDIDATURE RETENUE',
                description:
                    `**Félicitations !**\n\n` +
                    `Si tu reçois ce message, c'est que **ta candidature a été retenue** pour rejoindre Farmer League ! 🌾\n\n` +
                    `────────────────────────\n\n` +
                    `**📅 PROCHAINE ÉTAPE : RÉUNION DE LANCEMENT**\n\n` +
                    `Une réunion est prévue prochainement pour :\n` +
                    `• Te présenter le système en détail\n` +
                    `• Répondre à tes questions\n` +
                    `• T'attribuer ton lien de tracking\n\n` +
                    `────────────────────────\n\n` +
                    `**✅ SI TU SERAS PRÉSENT :**\n` +
                    `Réagis à ce message avec ✅\n\n` +
                    `**❌ SI TU SERAS ABSENT :**\n` +
                    `Envoie un DM à un admin pour obtenir le compte rendu de la réunion\n\n` +
                    `────────────────────────\n\n` +
                    `**Bienvenue dans la League ! 🚀**`,
                timestamp: new Date(),
                footer: {
                    text: 'Farmer League'
                }
            }]
        });

        // Ajouter les réactions
        await message.react('✅');
        await message.react('❌');

        console.log('✅ Message envoyé avec succès !');
        console.log(`📝 ID du message: ${message.id}`);
        console.log(`🔗 Lien du message: ${message.url}`);

        console.log('\n✅ TERMINÉ !');
        console.log(`📢 Canal créé: ${rookieChannel.name}`);
        console.log(`🔒 Permissions: Visible uniquement par les Rookies`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
