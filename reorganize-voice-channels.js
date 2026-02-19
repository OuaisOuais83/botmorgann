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

    // 1. Créer ou trouver la catégorie VOCAL (en haut)
    let vocalCategory = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name === '🎙️ VOCAL'
    );

    if (!vocalCategory) {
        console.log('⏳ Création de la catégorie 🎙️ VOCAL...');
        vocalCategory = await guild.channels.create({
            name: '🎙️ VOCAL',
            type: ChannelType.GuildCategory,
            position: 0 // Tout en haut
        });
        console.log('✅ Catégorie créée');
    }

    // 2. Trouver les rôles
    const adminRole = guild.roles.cache.find(r => r.name.includes('Admin'));
    const rookieRole = guild.roles.cache.find(r => r.name.includes('Rookie'));

    console.log(`\n📋 Rôles trouvés :`);
    console.log(`  Admin: ${adminRole?.name || 'NON TROUVÉ'}`);
    console.log(`  Rookie: ${rookieRole?.name || 'NON TROUVÉ'}`);

    // 3. Supprimer les anciens salons vocaux s'ils existent
    const oldVoiceChannels = guild.channels.cache.filter(ch =>
        ch.type === ChannelType.GuildVoice &&
        (ch.name.includes('Bureau Admin') || ch.name.includes('Réunion') || ch.name.includes('Salon Communautaire'))
    );

    for (const [id, channel] of oldVoiceChannels) {
        console.log(`🗑️  Suppression de l'ancien canal : ${channel.name}`);
        await channel.delete();
    }

    // 4. Créer les nouveaux salons vocaux avec permissions
    console.log('\n⏳ Création des nouveaux salons vocaux...\n');

    // Bureau Admin - Admin seulement
    const permissionsBureauAdmin = [
        {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel]
        }
    ];
    if (adminRole) {
        permissionsBureauAdmin.push({
            id: adminRole.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        });
    }

    await guild.channels.create({
        name: '🎙️ Bureau Admin',
        type: ChannelType.GuildVoice,
        parent: vocalCategory.id,
        permissionOverwrites: permissionsBureauAdmin
    });
    console.log('✅ Bureau Admin créé (Admin seulement)');

    // Réunion - À partir de Rookie
    const permissionsReunion = [
        {
            id: guild.id, // @everyone
            deny: [PermissionFlagsBits.ViewChannel]
        }
    ];
    if (rookieRole) {
        permissionsReunion.push({
            id: rookieRole.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        });
    }
    if (adminRole) {
        permissionsReunion.push({
            id: adminRole.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
        });
    }

    await guild.channels.create({
        name: '📞 Réunion',
        type: ChannelType.GuildVoice,
        parent: vocalCategory.id,
        permissionOverwrites: permissionsReunion
    });
    console.log('✅ Réunion créé (Rookie et supérieur)');

    // Salon Communautaire - Tous
    await guild.channels.create({
        name: '🗣️ Salon Communautaire',
        type: ChannelType.GuildVoice,
        parent: vocalCategory.id,
        permissionOverwrites: [
            {
                id: guild.id, // @everyone
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
            }
        ]
    });
    console.log('✅ Salon Communautaire créé (Tous)');

    console.log('\n✨ Salons vocaux configurés avec succès !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
