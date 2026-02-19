
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'farmer_league_bot.json');

function repairApplications() {
    try {
        if (!fs.existsSync(dbPath)) {
            console.error('❌ Base de données introuvable !');
            return;
        }

        const data = fs.readFileSync(dbPath, 'utf8');
        const database = JSON.parse(data);

        console.log(`📊 Utilisateurs trouvés: ${database.users.length}`);
        console.log(`📝 Applications actuelles: ${database.applications.length}`);

        let fixedCount = 0;

        database.users.forEach(user => {
            // Si l'utilisateur est Rookie (ou plus) ET n'a pas de candidature
            const hasApp = database.applications.find(app => app.user_id === user.user_id);

            if (!hasApp && (user.level === 'rookie' || user.level === 'hustler' || user.level === 'grinder' || user.level === 'elite')) {
                console.log(`🛠️ Réparation pour ${user.username} (${user.user_id})...`);

                // Créer une candidature "archivée"
                const restoredApp = {
                    id: Math.floor(Math.random() * 100000) + 1000, // ID aléatoire pour éviter conflits
                    user_id: user.user_id,
                    username: user.username,
                    experience: "Données récupérées (Restauration Système)",
                    portfolio: "Données récupérées",
                    motivation: "Membre historique restauré automatiquement.",
                    status: "approved",
                    applied_at: user.joined_at || new Date().toISOString(),
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: "SYSTEM_REPAIR"
                };

                database.applications.push(restoredApp);
                fixedCount++;
            }
        });

        if (fixedCount > 0) {
            fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
            console.log(`✅ ${fixedCount} candidatures restaurées avec succès !`);
        } else {
            console.log('✅ Aucune restauration nécessaire.');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la réparation:', error);
    }
}

repairApplications();
