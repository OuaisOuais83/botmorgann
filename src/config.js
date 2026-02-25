// Configuration centrale du bot
module.exports = {
    // Couleurs du serveur (thème Farmer League: vert/bleu/or)
    colors: {
        primary: 0x2ECC71,    // Vert Émeraude (New Client/Primary)
        success: 0x00E676,    // Vert Success
        error: 0xFF5252,      // Rouge Error
        warning: 0xFFAB40,    // Orange Warning
        elite: 0x00FFFF,      // Diamant Elite
        grinder: 0xFFD700,    // Or Grinder
        hustler: 0xC0C0C0,    // Argent Hustler
        rookie: 0xCD7F32      // Bronze Rookie
    },

    // Rôles du serveur (hoisted: true crée une section dans la liste des membres)
    roles: {
        client: { name: '👔 Client', color: 0x2ECC71, hoisted: true },
        admin: { name: '👑 Admin Farmer League', color: 0xFF003C, hoisted: true },
        moderator: { name: '🛡️ Modérateur', color: 0x3498DB, hoisted: true },
        elite: { name: '💎 Elite', color: 0x00FFFF, hoisted: true },
        grinder: { name: '🥇 Grinder', color: 0xFFD700, hoisted: true },
        hustler: { name: '🥈 Hustler', color: 0xC0C0C0, hoisted: true },
        rookie: { name: '🥉 Rookie', color: 0xCD7F32, hoisted: true },
        founding: { name: '🌾 Founding Member', color: 0xFFD700, hoisted: true },
        badge10Clips: { name: '🔥 10 Clips Semaine', color: 0xFF6B00, hoisted: false },
        champion: { name: '🏆 Champion', color: 0x00E676, hoisted: true },
        applicant: { name: '📋 Candidat', color: 0x607D8B, hoisted: false }
    },

    // Niveaux et seuils de points
    levels: {
        rookie: { min: 0, max: 500, payment: 10, name: 'Rookie' },
        hustler: { min: 501, max: 2000, payment: 15, name: 'Hustler' },
        grinder: { min: 2001, max: 5000, payment: 20, name: 'Grinder' },
        elite: { min: 5001, max: 999999, payment: 30, name: 'Elite' }
    },

    // Points par action
    points: {
        clipValidated: 100,
        bonusSpeed: 50,      // Moins de 6h
        bonusQualityA: 75,   // Note A+
        bonusQualityB: 25,   // Note A
        clipViral: 500,      // Plus de 100k vues
        dailyStreak: 25,     // Par jour de streak
        referral: 200        // Parrainage
    },

    // Notes de validation
    grades: {
        'A+': { points: 175, multiplier: 1.75, emoji: '🌟' },
        'A': { points: 125, multiplier: 1.25, emoji: '⭐' },
        'B': { points: 100, multiplier: 1.0, emoji: '✅' },
        'C': { points: 75, multiplier: 0.75, emoji: '🆗' },
        'F': { points: 0, multiplier: 0, emoji: '❌' }
    },

    // Structure des canaux (sera créée par /setup)
    channels: {
        categories: {
            welcome: '━━━ 📢 BIENVENUE ━━━',
            growth: '━━━ 🌱 COMMUNAUTÉ ━━━',
            training: '━━━ 🚜・FARMING ━━━',
            production: '━━━ ⚙️ PRODUCTION ━━━',
            money: '━━━ 💰 RÉMUNÉRATION ━━━',
            elite: '━━━ 👑 ZONE ELITE ━━━',
            management: '━━━ 🏢 MANAGEMENT ━━━',
            vocal: '━━━ 🎙️ VOCAL ━━━',
            tickets: '━━━ 🎫 CANDIDATURES ━━━'
        },
        welcome: [
            { name: '👋・accueil', type: 'text' },
            { name: '📢・annonces-générales', type: 'text' },
            { name: '🌾・notre-vision', type: 'text' },
            { name: '🏆・hall-of-fame', type: 'text' }
        ],
        growth: [
            { name: '🎯・défis-hebdomadaires', type: 'text' },
            { name: '👥・parrainage', type: 'text' },
            { name: '⚔️・tournois', type: 'text' }
        ],
        training: [
            { name: '🎯・missions-hebdo', type: 'text' }
        ],
        production: [
            { name: '🎬・projets-disponibles', type: 'text' },
            { name: '🔄・projets-en-cours', type: 'text' },
            { name: '✅・projets-en-validation', type: 'text' },
            { name: '🚀・projets-publiés', type: 'text' }
        ],
        money: [
            { name: '💵・compteur-gains', type: 'text' },
            { name: '🏆・bonus-et-badges', type: 'text' }
        ],
        elite: [
            { name: '💎・salon-vip', type: 'text' },
            { name: '🎯・missions-premium', type: 'text' }
        ],
        tickets: [],
        management: [
            { name: '📋・admin-général', type: 'text' },
            { name: '🆘・problèmes-support', type: 'text' },
            { name: '📱・tracking-comptes', type: 'text' },
            { name: '📊・stats-communauté', type: 'text' },
            { name: '💼・acquisition-clients', type: 'text' },
            { name: '✅・validation-projets', type: 'text' }
        ]
    },

    // Messages de motivation (ton professionnel tutoyé)
    motivationMessages: [
        '🌾 Chaque clip que tu crées développe ton style - Continue de cultiver ton talent',
        '📊 La qualité paie toujours - Farmer League récompense l\'excellence',
        '🎬 Aujourd\'hui, un nouveau défi t\'attend pour progresser',
        '🚀 Les pionniers d\'aujourd\'hui sont les légendes de demain',
        '💎 Ton skill d\'aujourd\'hui = ton salaire de demain',
        '🔥 Le talent seul ne suffit pas - La régularité fait la différence',
        '⚡ Chaque clip est une opportunité d\'apprendre et de grandir',
        '💪 On grandit ensemble - Ta progression renforce toute l\'équipe',
        '🎯 Focus sur la progression, pas la perfection',
        '🏆 Les meilleurs monteurs sont ceux qui ne s\'arrêtent jamais d\'apprendre'
    ],

    // Configuration de paiement minimum
    minWithdrawal: 50
};
