require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('🔧 Nettoyage et configuration des rôles...\n');

    // 1. Supprimer le doublon "Client" (position 12, créé en double)
    const clientRoles = guild.roles.cache.filter(r => r.name === 'Client');
    if (clientRoles.size > 1) {
        console.log(`⚠️  ${clientRoles.size} rôles "Client" trouvés, suppression du doublon...`);
        // Garder celui avec le plus de membres ou le plus ancien
        const sortedClients = [...clientRoles.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        for (let i = 1; i < sortedClients.length; i++) {
            await sortedClients[i].delete('Suppression du doublon');
            console.log(`🗑️  Rôle "Client" (position ${sortedClients[i].position}) supprimé`);
        }
    }

    // 2. Activer Hoist sur tous les rôles importants
    const rolesToHoist = [
        '👔 Client',
        '👑 Admin Farmer League',
        '🛡️ Modérateur',
        '💎 Elite',
        '🥇 Grinder',
        '🥈 Hustler',
        '🥉 Rookie',
        '📋 Candidat',
        '🏆 Champion'
    ];

    for (const roleName of rolesToHoist) {
        const role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.log(`⚠️  Rôle non trouvé : ${roleName}`);
            continue;
        }

        if (!role.hoist) {
            console.log(`⏳ Activation de l'affichage séparé pour ${roleName}...`);
            await role.setHoist(true, 'Afficher les membres par rôle');
            console.log(`✅ ${roleName} maintenant affiché séparément`);
        } else {
            console.log(`✅ ${roleName} déjà configuré`);
        }
    }

    // 3. Réorganiser les positions
    const clientRole = guild.roles.cache.find(r => r.name === '👔 Client');
    const adminRole = guild.roles.cache.find(r => r.name.includes('Admin Farmer'));

    if (clientRole && adminRole && clientRole.position < adminRole.position) {
        console.log('\n⏳ Repositionnement du rôle Client au-dessus Admin...');
        await clientRole.setPosition(adminRole.position + 1);
        console.log('✅ Client repositionné');
    }

    console.log('\n✨ Configuration terminée !');
    console.log('\n💡 Rafraîchis Discord (Ctrl+R ou redémarre l\'appli) pour voir les changements');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
