require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./src/database/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TEST DU SYSTÈME DE PARRAINAGE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialiser la base de données
    await db.initDatabase();

    const guild = client.guilds.cache.first();
    if (!guild) {
        console.error('❌ Aucun serveur trouvé !');
        process.exit(1);
    }

    console.log(`📊 Serveur: ${guild.name}\n`);

    // Test 1: Vérifier que les commandes sont enregistrées
    console.log('🔍 TEST 1: Vérification des commandes');
    try {
        const commands = await guild.commands.fetch();
        const referralCommand = commands.find(cmd => cmd.name === 'mon-lien-parrainage');
        const statsCommand = commands.find(cmd => cmd.name === 'mes-parrainages');

        if (referralCommand) {
            console.log('✅ Commande /mon-lien-parrainage trouvée');
        } else {
            console.log('❌ Commande /mon-lien-parrainage NON trouvée - Redémarre le bot avec npm start');
        }

        if (statsCommand) {
            console.log('✅ Commande /mes-parrainages trouvée');
        } else {
            console.log('❌ Commande /mes-parrainages NON trouvée - Redémarre le bot avec npm start');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des commandes:', error.message);
    }

    // Test 2: Vérifier la structure de la DB
    console.log('\n🔍 TEST 2: Vérification de la base de données');
    const allUsers = db.getAllUsers();

    if (allUsers.length > 0) {
        const sampleUser = allUsers[0];
        const hasReferralFields =
            'referral_link' in sampleUser &&
            'referral_points' in sampleUser &&
            'referral_count' in sampleUser;

        if (hasReferralFields) {
            console.log('✅ Champs de parrainage présents dans les utilisateurs');
            console.log(`   Sample user: ${sampleUser.username}`);
            console.log(`   - referral_link: ${sampleUser.referral_link || 'null'}`);
            console.log(`   - referral_points: ${sampleUser.referral_points}`);
            console.log(`   - referral_count: ${sampleUser.referral_count}`);
        } else {
            console.log('❌ Champs de parrainage MANQUANTS dans les utilisateurs');
            console.log('   Les utilisateurs existants n\'ont pas les nouveaux champs');
            console.log('   Ils seront ajoutés automatiquement aux nouveaux utilisateurs');
        }
    } else {
        console.log('⚠️ Aucun utilisateur dans la base de données');
    }

    // Test 3: Vérifier le tableau referrals
    console.log('\n🔍 TEST 3: Vérification du tableau referrals');
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, 'farmer_league_bot.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    if ('referrals' in dbData) {
        console.log(`✅ Tableau 'referrals' présent (${dbData.referrals.length} entrées)`);
    } else {
        console.log('❌ Tableau \'referrals\' MANQUANT');
    }

    // Test 4: Lister toutes les invitations actuelles
    console.log('\n🔍 TEST 4: Invitations Discord actuelles');
    try {
        const invites = await guild.invites.fetch();
        console.log(`📋 ${invites.size} invitation(s) active(s):\n`);

        invites.forEach(invite => {
            const creator = invite.inviter ? invite.inviter.username : 'Unknown';
            console.log(`   Code: ${invite.code}`);
            console.log(`   Créateur: ${creator}`);
            console.log(`   Utilisations: ${invite.uses}/${invite.maxUses || '∞'}`);

            // Chercher si cette invitation appartient à un utilisateur
            const owner = allUsers.find(u => u.referral_link === invite.code);
            if (owner) {
                console.log(`   ✅ Associée à: ${owner.username}`);
            }
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des invitations:', error.message);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TESTS TERMINÉS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 PROCHAINES ÉTAPES:');
    console.log('1. Tape /mon-lien-parrainage dans Discord pour tester');
    console.log('2. Vérifie que ton lien est créé et stocké en base');
    console.log('3. Tape /mes-parrainages pour voir tes stats\n');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
