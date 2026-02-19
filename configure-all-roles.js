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

    console.log(`\n📊 Configuration complète de l'affichage des rôles...\n`);

    // Ordre d'affichage souhaité (du haut vers le bas)
    const roleHierarchy = [
        'Client',
        '👑 Admin Farmer League',
        '🛡️ Modérateur',
        '💎 Elite',
        '🥇 Grinder',
        '🥈 Hustler',
        '🥉 Rookie'
    ];

    let position = 10; // Position de départ (assez haute pour être au-dessus)

    for (const roleName of roleHierarchy) {
        const role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.log(`⚠️  Rôle non trouvé : ${roleName}`);
            continue;
        }

        console.log(`⏳ Configuration de ${roleName}...`);

        // Activer l'affichage séparé (hoist)
        if (!role.hoist) {
            await role.setHoist(true, 'Afficher les membres par rôle');
        }

        // Définir la position (plus le nombre est élevé, plus le rôle est haut)
        await role.setPosition(position, { reason: 'Réorganisation hiérarchie' });

        console.log(`✅ ${roleName} : Position ${position}, Affiché séparément`);
        position--;
    }

    console.log('\n✨ Configuration terminée !');
    console.log('\n📋 Ordre d\'affichage des membres (du haut vers le bas) :');
    roleHierarchy.forEach((name, index) => {
        console.log(`   ${index + 1}. ${name}`);
    });

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
