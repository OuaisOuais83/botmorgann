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

    console.log('📊 État actuel des rôles :\n');

    // Récupérer tous les rôles triés par position
    const roles = [...guild.roles.cache.values()]
        .filter(r => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position);

    console.log('Position | Nom du rôle | Hoist (affichage séparé) | Couleur');
    console.log('---------|-------------|--------------------------|--------');

    for (const role of roles) {
        const hoistStatus = role.hoist ? '✅ OUI' : '❌ NON';
        const colorHex = role.color.toString(16).padStart(6, '0');
        console.log(`${role.position.toString().padEnd(9)}| ${role.name.padEnd(12)}| ${hoistStatus.padEnd(25)}| #${colorHex}`);
    }

    console.log('\n💡 Note : Pour que les membres soient affichés séparément,');
    console.log('   le paramètre "Hoist" doit être à ✅ OUI');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
