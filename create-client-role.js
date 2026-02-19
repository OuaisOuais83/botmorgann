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

    console.log(`\n📊 Création et configuration du rôle Client...\n`);

    // Vérifier si le rôle Client existe
    let clientRole = guild.roles.cache.find(r => r.name === 'Client');

    if (!clientRole) {
        console.log('⏳ Création du rôle Client...');
        clientRole = await guild.roles.create({
            name: 'Client',
            color: 0x00D9FF, // Bleu cyan
            hoist: true,
            reason: 'Rôle pour les clients'
        });
        console.log('✅ Rôle Client créé');
    } else {
        console.log('ℹ️  Rôle Client existe déjà');
        // S'assurer que hoist est activé
        if (!clientRole.hoist) {
            await clientRole.setHoist(true);
        }
    }

    // Trouver le rôle Admin pour se positionner au-dessus
    const adminRole = guild.roles.cache.find(r => r.name.includes('Admin'));

    if (adminRole) {
        // Positionner Client juste au-dessus d'Admin
        const targetPosition = adminRole.position + 1;
        await clientRole.setPosition(targetPosition, { reason: 'Positionner Client au-dessus Admin' });
        console.log(`✅ Client positionné au-dessus de ${adminRole.name}`);
    }

    // Liste finale des rôles avec affichage séparé
    console.log('\n📋 Ordre final des membres (du haut vers le bas) :');
    console.log('   1. 👤 Client');
    console.log('   2. 👑 Admin Farmer League');
    console.log('   3. 🛡️ Modérateur');
    console.log('   4. 💎 Elite');
    console.log('   5. 🥇 Grinder');
    console.log('   6. 🥈 Hustler');
    console.log('   7. 🥉 Rookie');

    console.log('\n✨ Configuration terminée !');
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
