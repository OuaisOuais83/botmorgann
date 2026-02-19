require('dotenv').config();
const db = require('./src/database/db');

async function check() {
    console.log('🔍 Vérification des données...');
    await db.initDatabase();

    const users = db.getAllUsers();
    console.log(`📊 Total Utilisateurs: ${users.length}`);

    // Check TestRookie (connu pour avoir un compte)
    const testUser = db.getUser('999999999999999999');
    console.log('\n👤 TestRookie (Fake):');
    if (testUser) {
        console.log(`   - Comptes: ${testUser.socialAccounts?.length || 0}`);
        if (testUser.socialAccounts) console.log(JSON.stringify(testUser.socialAccounts, null, 2));
    } else {
        console.log('   - Introuvable');
    }

    // Check Admin (To see if they are in DB)
    const ADMIN_ID = process.env.ADMIN_ID; // 1457731497036480604
    console.log(`\n👑 Admin (${ADMIN_ID}):`);
    const adminUser = db.getUser(ADMIN_ID);
    if (adminUser) {
        console.log(`   - Username: ${adminUser.username}`);
        console.log(`   - Comptes: ${adminUser.socialAccounts?.length || 0}`);
        if (adminUser.socialAccounts?.length > 0) {
            console.log(JSON.stringify(adminUser.socialAccounts, null, 2));
        } else {
            console.log('   ⚠️ Aucun compte social trouvé.');
        }
    } else {
        console.log('   ⚠️ Utilisateur Admin introuvable dans la DB.');
    }
}

check();
