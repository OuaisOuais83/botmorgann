require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

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

    console.log(`\n📊 Configuration de l'affichage des rôles...\n`);

    // Rôles à afficher séparément (par ordre de hiérarchie)
    const rolesToHoist = [
        '👑 Admin Farmer League',
        '🛡️ Modérateur',
        '💎 Elite',
        '🥇 Grinder',
        '🥈 Hustler',
        '🥉 Rookie'
    ];

    for (const roleName of rolesToHoist) {
        const role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.log(`⚠️  Rôle non trouvé : ${roleName}`);
            continue;
        }

        // Vérifier si le rôle est déjà configuré
        if (role.hoist) {
            console.log(`✅ ${roleName} : Déjà affiché séparément`);
        } else {
            console.log(`⏳ Configuration de ${roleName}...`);
            await role.setHoist(true, 'Afficher les membres par rôle');
            console.log(`✅ ${roleName} : Maintenant affiché séparément`);
        }
    }

    console.log('\n✨ Configuration terminée !');
    console.log('\n📋 Les membres connectés seront maintenant triés par rôle :');
    console.log('   1. Admin Farmer League');
    console.log('   2. Modérateur');
    console.log('   3. Elite');
    console.log('   4. Grinder');
    console.log('   5. Hustler');
    console.log('   6. Rookie');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
