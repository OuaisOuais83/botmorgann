const db = require('./src/database/db');

async function listPending() {
    await db.initDatabase();
    const apps = db.getAllApplications();

    console.log(`📋 Total Candidatures: ${apps.length}`);

    const pending = apps.filter(a => a.status === 'pending');
    console.log(`⏳ En attente: ${pending.length}`);

    pending.forEach(app => {
        console.log(`   - ID: ${app.id} | User: ${app.username} (${app.user_id})`);
    });

    console.log('\n✅ Terminés (Approved/Rejected):');
    apps.filter(a => a.status !== 'pending').slice(0, 5).forEach(app => {
        console.log(`   - ID: ${app.id} | Status: ${app.status} | User: ${app.username}`);
    });
}

listPending();
