require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./src/database/db');
const notifications = require('./src/utils/notifications');

// --- CONFIGURATION TEST ---
const TEST_USER_ID = '999999999999999999'; // Fake User ID
const TEST_REFERRER_ID = '888888888888888888'; // Fake Referrer ID
const TEST_CHANNEL_ID = '1470227353132204095'; // Channel #tracking-comptes

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ]
});

async function runTests() {
    console.log('🧪 Démarrage des tests système...');

    // 1. Initialiser la DB
    await db.initDatabase();
    console.log('✅ Base de données initialisée.');

    // 2. Créer des utilisateurs de test
    console.log('\n👤 Test création utilisateurs...');
    let referrer = db.getUser(TEST_REFERRER_ID);
    if (!referrer) {
        referrer = await db.createUser(TEST_REFERRER_ID, 'TestReferrer');
        db.updateUserReferralLink(TEST_REFERRER_ID, 'TEST-CODE-123');
        console.log('   - Parrain créé.');
    } else {
        console.log('   - Parrain existant récupéré.');
    }

    let user = db.getUser(TEST_USER_ID);
    if (!user) {
        user = await db.createUser(TEST_USER_ID, 'TestRookie');
        console.log('   - Rookie créé.');
    } else {
        console.log('   - Rookie existant récupéré.');
    }

    // 3. Simuler un Parrainage
    console.log('\n🤝 Test Parrainage...');
    let referral = db.getReferralByReferred(TEST_USER_ID);
    if (!referral) {
        // Fix func name call if needed based on previous file read
        referral = await db.createReferral(TEST_REFERRER_ID, 'TestReferrer', TEST_USER_ID, 'TestRookie', 'TEST-CODE-123');
        console.log('   - Parrainage enregistré.');
    } else {
        console.log('   - Parrainage déjà existant.');
    }

    // Connecter le client pour les notifications
    console.log('\n🔌 Connexion Discord pour tests notifications...');
    await client.login(process.env.DISCORD_TOKEN);
    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('❌ Aucun serveur trouvé. Impossible de tester les notifs.');
        return;
    }

    // 4. Test Notification Parrainage
    console.log('\n📨 Test Notif: Nouveau Parrainage...');
    try {
        await notifications.notifyReferral(guild, referrer, { username: 'TestRookie', id: TEST_USER_ID, toString: () => `<@${TEST_USER_ID}>` });
        console.log('   ✅ Notification envoyée.');
    } catch (e) {
        console.error('   ❌ Erreur notif:', e);
    }

    // 5. Simuler Candidature
    console.log('\n📝 Test Candidature...');
    const app = await db.createApplication(TEST_USER_ID, 'TestRookie', '2 ans exp', 'https://portfolio.com', 'Je suis motivé');
    console.log(`   - Candidature #${app.id} créée.`);

    console.log('\n📨 Test Notif: Nouvelle Candidature...');
    try {
        await notifications.notifyApplication(guild, app, { username: 'TestRookie', id: TEST_USER_ID, toString: () => `<@${TEST_USER_ID}>` });
        console.log('   ✅ Notification envoyée.');
    } catch (e) {
        console.error('   ❌ Erreur notif:', e);
    }

    // 6. Simuler Approbation (Review)
    console.log('\n✅ Test Approbation Candidature...');
    await db.updateApplicationStatus(app.id, 'approved', 'ADMIN_ID');
    console.log('   - Statut mis à jour en DB.');

    // Simuler triggers de récompense
    const { onApplicationApproved } = require('./src/utils/referralTracking');
    await onApplicationApproved(TEST_USER_ID, client); // Should reward referrer

    // Vérifier les points du parrain
    const updatedReferrer = db.getUser(TEST_REFERRER_ID);
    console.log(`   - Points Parrain après validation: ${updatedReferrer.referral_points} (Devrait être +50)`);

    console.log('\n📨 Test Notif: Candidature Approuvée...');
    try {
        await notifications.notifyReview(guild, app, 'approved', { username: 'AdminTest', id: 'ADMIN_ID', toString: () => `<@ADMIN_ID>` });
        console.log('   ✅ Notification envoyée.');
    } catch (e) {
        console.error('   ❌ Erreur notif:', e);
    }

    // 7. Test Déclaration Compte
    console.log('\n📱 Test Déclaration Compte Social...');
    try {
        const account = await db.addSocialAccount(TEST_USER_ID, 'TikTok', '@testrookie', 'https://tiktok.com/@testrookie', 1000);
        console.log('   - Compte ajouté en DB.');

        const accounts = db.getSocialAccounts(TEST_USER_ID);
        console.log(`   - Total comptes pour Rookie: ${accounts.length}`);

        console.log('\n📨 Test Notif: Déclaration Compte...');
        await notifications.notifyAccountDeclaration(guild, { username: 'TestRookie', id: TEST_USER_ID, toString: () => `<@${TEST_USER_ID}>` }, account, accounts.length);
        console.log('   ✅ Notification envoyée.');

    } catch (e) {
        if (e.message.includes('déjà')) {
            console.log('   - Compte déjà existant (Test précédent).');
        } else {
            console.error('   ❌ Erreur ajout compte:', e);
        }
    }

    // 8. Vérifier "accès aux comptes" (Audit complet)
    console.log('\n🔍 Audit des comptes déclarés (Global)...');
    const allAccounts = db.getAllSocialAccounts();
    console.log(`   - Total utilisateurs avec comptes: ${allAccounts.length}`);
    if (allAccounts.length > 0) {
        console.log('   - Exemple:', JSON.stringify(allAccounts[0], null, 2));
    }

    console.log('\n🚧 Fin des tests. Vérifiez le canal #tracking-comptes sur Discord !');
    process.exit(0);
}

runTests().catch(console.error);
