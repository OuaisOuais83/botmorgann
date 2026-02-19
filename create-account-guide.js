
require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    try {
        console.log('🚀 Script de configuration (Guide + Vérifs)...');
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        if (!guild) {
            console.error('❌ Serveur introuvable.');
            return;
        }
        console.log(`Serveur: ${guild.name}`);

        // 1. GESTION CATEGORIE REMUNERATION
        const categoryName = config.channels.categories.money; // '━━━ 💰 RÉMUNÉRATION ━━━'
        let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);

        if (!category) {
            console.log(`🔨 La catégorie '${categoryName}' n'existe pas. Création...`);
            category = await guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory
            });
            console.log('✅ Catégorie créée.');
        } else {
            console.log(`✅ Catégorie '${categoryName}' trouvée.`);
        }

        // 2. CREATION CHANNEL GUIDE
        const channelName = '📝・déclarer-comptes';
        let channel = guild.channels.cache.find(c => c.name === channelName && c.parentId === category.id);

        if (!channel) {
            console.log(`🔨 Création du channel ${channelName}...`);
            channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            });
            console.log('✅ Channel créé.');
        } else {
            console.log('ℹ️ Le channel guide existe déjà.');
        }

        // POST DU MESSAGE
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('📱 Comment déclarer tes comptes sociaux ?')
            .setDescription(
                `Pour être rémunéré, tu dois déclarer les comptes sur lesquels tu postes tes clips.\n\n` +
                `**1️⃣ Ajouter un compte :**\n` +
                `Utilise la commande \`/declare-accounts\`\n` +
                `• Indique la plateforme (TikTok, Instagram...)\n` +
                `• Ton pseudo (@...)\n` +
                `• Le lien direct de ton profil\n` +
                `• Tes followers actuels\n\n` +

                `**2️⃣ Modifier une erreur :**\n` +
                `Tu t'es trompé de lien ou de pseudo ? Pas de panique !\n` +
                `Utilise la commande \`/edit-account\`\n` +
                `• Sélectionne le compte à corriger\n` +
                `• Modifie les informations\n\n` +

                `**3️⃣ Voir tes comptes :**\n` +
                `Utilise la commande \`/my-accounts\` pour voir la liste de ce que tu as déclaré.\n\n` +

                `⚠️ **Important :**\n` +
                `• Seuls les comptes déclarés peuvent recevoir un lien de tracking affilié.\n` +
                `• Si tu ne déclares pas ton compte, nous ne pourrons pas valider tes vues.`
            )
            .setFooter({ text: 'Farmer League • Gestion des comptes' });

        // Nettoyage ancien messages
        try {
            const messages = await channel.messages.fetch({ limit: 5 });
            if (messages.size > 0) await channel.bulkDelete(messages);
        } catch (e) { }

        await channel.send({ embeds: [embed] });
        console.log('✅ Message guide posté.');

        // 3. VERIFICATION TRACKING CHANNEL
        const trackingName = '📱・tracking-comptes';
        const trackingChannel = guild.channels.cache.find(c => c.name === trackingName);

        if (trackingChannel) {
            console.log(`✅ Channel de notification '${trackingName}' trouvé (ID: ${trackingChannel.id}).`);
        } else {
            console.error(`❌ Channel de notification '${trackingName}' INTROUVABLE !`);
            console.log('⚠️ Les admins ne recevront pas de notifs. Création automatique...');

            // Chercher catégorie Management
            const managementCatName = config.channels.categories.management;
            const managementCat = guild.channels.cache.find(c => c.name === managementCatName && c.type === ChannelType.GuildCategory);

            if (managementCat) {
                await guild.channels.create({
                    name: trackingName,
                    type: ChannelType.GuildText,
                    parent: managementCat.id
                });
                console.log('✅ Channel #tracking-comptes créé dans Management.');
            } else {
                console.log('❌ Impossible de créer #tracking-comptes (Catégorie Management introuvable).');
            }
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        setTimeout(() => {
            console.log('👋 Fin.');
            client.destroy();
        }, 1000);
    }
});

client.login(process.env.DISCORD_TOKEN);
