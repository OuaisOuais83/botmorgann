require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    // Trouver la catégorie VOCAL
    const vocalCategory = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name === '🎙️ VOCAL'
    );

    if (!vocalCategory) {
        console.error('❌ Catégorie VOCAL non trouvée');
        process.exit(1);
    }

    // Trouver les rôles
    const adminRole = guild.roles.cache.find(r => r.name.includes('Admin'));
    const rookieRole = guild.roles.cache.find(r => r.name.includes('Rookie'));
    const hustlerRole = guild.roles.cache.find(r => r.name.includes('Hustler'));
    const grinderRole = guild.roles.cache.find(r => r.name.includes('Grinder'));
    const eliteRole = guild.roles.cache.find(r => r.name.includes('Elite'));
    const modRole = guild.roles.cache.find(r => r.name.includes('Modérateur'));

    console.log('✅ Catégorie VOCAL trouvée');

    // Vérifier les canaux existants
    const existingChannels = {
        bureau: guild.channels.cache.find(ch => ch.name.includes('Bureau Admin')),
        reunion: guild.channels.cache.find(ch => ch.name.includes('Réunion')),
        communautaire: guild.channels.cache.find(ch => ch.name.includes('Salon Communautaire'))
    };

    // Réunion - À partir de Rookie (si n'existe pas)
    if (!existingChannels.reunion) {
        console.log('⏳ Création de Réunion...');
        const permissionsReunion = [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            }
        ];

        // Ajouter tous les rôles de Rookie et supérieur
        for (const role of [rookieRole, hustlerRole, grinderRole, eliteRole, adminRole, modRole]) {
            if (role) {
                permissionsReunion.push({
                    id: role.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                });
            }
        }

        await guild.channels.create({
            name: '📞 Réunion',
            type: ChannelType.GuildVoice,
            parent: vocalCategory.id,
            permissionOverwrites: permissionsReunion
        });
        console.log('✅ Réunion créé');
    } else {
        console.log('ℹ️  Réunion existe déjà');
    }

    // Salon Communautaire - Tous (si n'existe pas)
    if (!existingChannels.communautaire) {
        console.log('⏳ Création de Salon Communautaire...');
        await guild.channels.create({
            name: '🗣️ Salon Communautaire',
            type: ChannelType.GuildVoice,
            parent: vocalCategory.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                }
            ]
        });
        console.log('✅ Salon Communautaire créé');
    } else {
        console.log('ℹ️  Salon Communautaire existe déjà');
    }

    console.log('\n✨ Configuration terminée !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
