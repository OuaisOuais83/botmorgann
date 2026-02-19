require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createApplication } = require('./src/database/db');
const embeds = require('./src/utils/embeds');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('🧪 CRÉATION D\'UNE CANDIDATURE TEST...\n');

    // Créer une fausse candidature dans la DB
    const testUserId = '999999999999999999'; // ID fictif
    const testUsername = 'TestCandidat';
    const experience = '3 ans de montage vidéo, spécialisé dans les reels Instagram et TikTok. Maîtrise de Premiere Pro et After Effects.';
    const portfolio = 'https://youtube.com/@testcandidat';
    const motivation = 'Je veux rejoindre Farmer League pour développer mes compétences et travailler sur des projets variés. Très motivé et disponible 20h/semaine.';

    createApplication(testUserId, testUsername, experience, portfolio, motivation);
    console.log('✅ Candidature test créée dans la DB\n');

    // Envoyer la notification dans #admin (comme le fait /apply)
    const adminChannel = guild.channels.cache.find(ch => ch.name.includes('admin'));

    if (!adminChannel) {
        console.error('❌ Canal admin non trouvé');
        process.exit(1);
    }

    // Trouver l'ID de la candidature
    const { getPendingApplications } = require('./src/database/db');
    const pendingApps = getPendingApplications();
    const testApp = pendingApps.find(app => app.user_id === testUserId);
    const appId = testApp ? testApp.id : '???';

    // Trouver les rôles Admin et Modérateur
    const adminRole = guild.roles.cache.find(r => r.name === '👑 Admin Farmer League');
    const modRole = guild.roles.cache.find(r => r.name === '🛡️ Modérateur');

    // Construire les mentions
    const roleMentions = [];
    if (adminRole) roleMentions.push(`<@&${adminRole.id}>`);
    if (modRole) roleMentions.push(`<@&${modRole.id}>`);
    const mentionText = roleMentions.length > 0 ? roleMentions.join(' ') : '@here';

    // Envoyer exactement comme dans apply.js
    await adminChannel.send({
        content: `${mentionText} 🚨 **Nouvelle candidature à traiter !**`,
        embeds: [embeds.info(
            '📋 Nouvelle candidature',
            `## Candidature #${appId}\n\n` +
            `**Candidat:** <@${testUserId}> (${testUsername})\n` +
            `**ID Discord:** \`${testUserId}\`\n\n` +
            `**💼 Expérience:**\n${experience}\n\n` +
            `**🎬 Portfolio:**\n${portfolio}\n\n` +
            `**💭 Motivation:**\n${motivation}\n\n` +
            `\n` +
            `**⚡ Actions rapides:**\n` +
            `✅ \`/review approve ${appId}\` → Accepter\n` +
            `❌ \`/review reject ${appId}\` → Refuser\n` +
            `📋 \`/review list\` → Voir toutes les candidatures`
        )]
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ NOTIFICATION TEST ENVOYÉE DANS #ADMIN !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📍 Va voir le canal #admin sur Discord !');
    console.log(`\n💡 Pour supprimer cette candidature test :`);
    console.log(`   /review reject ${appId}\n`);

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
