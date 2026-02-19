const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'farmer_league_bot.json');

try {
    if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf8');
        const database = JSON.parse(data);

        // Trouver la mission "LE MEILLEUR HOOK"
        const mission = database.missions.find(m => m.title.includes('HOO'));

        if (mission) {
            mission.payment = 0;
            mission.description = `Le Hook est l’élément le plus CRITIQUE de ton clip. Sur Instagram et TikTok, tu as moins de 1 seconde pour capturer l'attention avant que l'utilisateur ne swipe.

**POURQUOI LE HOOK EST VITAL SUR INSTA :**
1. **Rétention immédiate** : Si l'utilisateur ne s'arrête pas, ton clip est mort. Un bon hook "casse" le scroll.
2. **Algorithme boosté** : Un fort taux de rétention dès les premières secondes signale à Instagram que ton contenu est premium.
3. **Curiosité** : Un bon hook pose une question ou montre un visuel que l'esprit veut ABSOLUMENT résoudre.

**TON OBJECTIF :**
Crée un clip court (5-15s) avec un hook ultra-impactant.
- Utilise du texte dynamique (gros, lisible).
- Utilise un "pattern interrupt" (visuel ou son surprenant).
- Pose un dilemme ou une promesse forte.

**RÉCOMPENSE :** 
Cette mission est accès sur ton **ÉVOLUTION**. 
- 📈 **Gros bonus de points** pour monter de niveau (Rookie -> Hustler -> Grinder).
- 🏆 **Éligibilité Prioritaire** pour les missions exclusives.
*Note : Ta rémunération principale provient de tes liens d'affiliation (200€/1000 clics).*`;

            fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
            console.log("✅ Mission mise à jour avec succès (0€, focus points).");
        } else {
            console.log("❌ Mission non trouvée.");
        }
    }
} catch (error) {
    console.error("❌ Erreur:", error.message);
}
