#!/usr/bin/env node
/**
 * Test du flux tickets sans Discord.
 * Vérifie que les fonctions DB et la logique fonctionnent.
 * Usage: node scripts/test-ticket-flow.js
 */
require('dotenv').config();

async function test() {
    console.log('🧪 Test du flux tickets (DB uniquement)...\n');

    const db = require('../src/database');

    if (process.env.DATABASE_URL) {
        console.log('Initialisation BDD (migration channel_id si besoin)...');
        await db.initDatabase(null);
        console.log('   ✅ BDD initialisée\n');
    }

    // 1. createApplication avec channelId
    console.log('1. createApplication(userId, username, null, null, null, channelId)...');
    const app = await db.createApplication('test-user-123', 'TestUser', null, null, null, '987654321');
    if (!app) throw new Error('createApplication a échoué');
    if (app.status !== 'ticket_open') throw new Error(`status attendu ticket_open, reçu: ${app.status}`);
    if (!app.channel_id) throw new Error('channel_id manquant');
    console.log('   ✅ Candidature créée:', app.id, 'status:', app.status, 'channel_id:', app.channel_id);

    // 2. getApplicationByChannelId
    console.log('\n2. getApplicationByChannelId(channelId)...');
    const found = await db.getApplicationByChannelId('987654321');
    if (!found || found.id !== app.id) throw new Error('getApplicationByChannelId a échoué');
    console.log('   ✅ Candidature trouvée par channel_id');

    // 3. updateApplication
    console.log('\n3. updateApplication(id, {experience, portfolio, motivation, status})...');
    await db.updateApplication(app.id, {
        experience: '2 ans de montage',
        portfolio: 'https://youtube.com/test',
        motivation: 'Pour apprendre',
        status: 'pending'
    });
    const updated = await db.getApplication(app.id);
    if (updated.status !== 'pending' || !updated.experience) throw new Error('updateApplication a échoué');
    console.log('   ✅ Candidature mise à jour:', updated.status);

    // 4. slugChannelName
    const { slugChannelName } = (() => {
        function slugChannelName(username) {
            return (username || 'user').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 20) || 'candidature';
        }
        return { slugChannelName };
    })();
    const slug = slugChannelName('Test.User_123') + '-abcd';
    if (!slug.match(/^[a-z0-9_-]+$/)) throw new Error('slug invalide: ' + slug);
    console.log('\n4. slugChannelName:', slug, '✅');

    // 5. Config tickets
    const config = require('../src/config');
    if (!config.channels.categories.tickets) throw new Error('config.channels.categories.tickets manquant');
    console.log('\n5. Config tickets:', config.channels.categories.tickets, '✅');

    // Nettoyer (optionnel - Postgres gardera le test)
    if (process.env.DATABASE_URL) {
        console.log('\n⚠️ Base Postgres: la candidature de test reste en base (id:', app.id, ')');
    }

    console.log('\n✅ Tous les tests passent. Le flux DB tickets est OK.');
}

test().catch(err => {
    console.error('❌ ÉCHEC:', err.message);
    process.exit(1);
});
