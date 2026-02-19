require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const notifications = require('./src/utils/notifications');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Test Backup connecté: ${client.user.tag}`);
    const guild = client.guilds.cache.first();

    // Fake Data
    const fakeUser = { id: '123456789', username: 'TestUserBackup', toString: () => '<@123456789>' };
    const fakeAccount = {
        platform: 'TikTok',
        handle: '@backup_test',
        profileLink: 'https://tiktok.com/@backup_test',
        followers: 50000
    };

    console.log('📨 Envoi notification test avec backup...');
    await notifications.notifyAccountDeclaration(guild, fakeUser, fakeAccount, 1);

    console.log('✅ Test envoyé. Vérifiez #tracking-comptes ET #sauvegarde-données');

    setTimeout(() => {
        client.destroy();
        process.exit(0);
    }, 2000);
});

client.login(process.env.DISCORD_TOKEN);
