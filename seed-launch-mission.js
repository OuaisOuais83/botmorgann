const { createMission } = require('./src/database/db');

async function seed() {
    const title = '🪝 MISSION : LE MEILLEUR HOOK';
    const description = `Le Hook est l’élément le plus CRITIQUE de ton clip. Sur Instagram et TikTok, tu as moins de 1 seconde pour capturer l'attention avant que l'utilisateur ne swipe.

**POURQUOI LE HOOK EST VITAL SUR INSTA :**
1. **Rétention immédiate** : Si l'utilisateur ne s'arrête pas, ton clip est mort. Un bon hook "casse" le scroll.
2. **Algorithme boosté** : Un fort taux de rétention dès les premières secondes signale à Instagram que ton contenu est premium.
3. **Curiosité** : Un bon hook pose une question ou montre un visuel que l'esprit veut ABSOLUMENT résoudre.

**TON OBJECTIF :**
Crée un clip court (5-15s) avec un hook ultra-impactant.
- Utilise du texte dynamique (gros, lisible).
- Utilise un "pattern interrupt" (visuel ou son surprenant).
- Pose un dilemme ou une promesse forte.

**RÉCOMPENSE :** 15€ + Bonus de points si viral !`;

    try {
        const mission = createMission(
            title,
            description,
            'express',
            15,
            '48h',
            'ADMIN_SYSTEM'
        );
        console.log(`✅ Mission créée avec succès ! ID: ${mission.id}`);
    } catch (error) {
        console.error('❌ Erreur lors de la création de la mission:', error.message);
    }
}

seed();
