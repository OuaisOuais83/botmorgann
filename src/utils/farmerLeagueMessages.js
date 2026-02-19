const { EmbedBuilder } = require('discord.js');
const config = require('../config');

// Contenu pour tous les canaux Farmer League
const channelMessages = {
    'accueil': async (channel) => {
        await channel.send(
            '🌾 **FARMER LEAGUE**\n\n' +
            'Des créateurs de contenu ont besoin de clips viraux.\n' +
            'Tu crées. Tu postes sur tes réseaux. Tu es payé.\n\n\n' +
            '**🎯 REVENU SUPPLÉMENTAIRE**\n\n' +
            'Maximise tes gains en plus de tes revenus :\n' +
            '→ TikTok Creativity\n' +
            '→ YouTube AdSense\n' +
            '→ Partenariats habituels\n\n\n' +
            '**🚀 POUR COMMENCER**\n\n' +
            '1️⃣ Lis notre vision dans <#notre-vision>\n' +
            '2️⃣ Tape la commande `/apply` ici même\n\n' +
            'Bienvenue dans la League ! 🌾💰'
        );
    },

    'notre-vision': async (channel) => {
        await channel.send(
            '💎 **VISION FARMER LEAGUE**\n\n' +
            '\n\n' +
            '**MISSION**\n' +
            'Revenu supplémentaire pour monteurs via créateurs de contenu.\n\n' +
            '\n\n' +
            '**FONCTIONNEMENT**\n\n' +
            'Créateur a besoin de clips\n' +
            '↓\n' +
            'Tu crées contenu selon brief\n' +
            '↓\n' +
            'Tu postes sur tes propres réseaux\n' +
            '↓\n' +
            'Tu es payé par validation\n\n' +
            '\n\n' +
            '**NIVEAUX**\n\n' +
            '🥉 Rookie → Missions standard\n' +
            '🥈 Hustler → Missions variées\n' +
            '🥇 Grinder → Missions premium\n' +
            '💎 Elite → Créateurs premium\n\n' +
            '\n\n' +
            '**MONÉTISATION MULTIPLE**\n\n' +
            'Farmer League s\'ajoute à :\n' +
            '• Revenus TikTok/YouTube\n' +
            '• Partenariats\n' +
            '• Clients directs\n\n' +
            '\n\n' +
            '**PIONNIERS**\n\n' +
            'Badge + Priorité + Premium\n\n' +
            '\n\n' +
            '🌾'
        );
    },

    'hall-of-fame': async (channel) => {
        await channel.send(
            '🏆 **HALL OF FAME**\n\n' +
            '\n\n' +
            'Les meilleurs clips de la communauté.\n\n' +
            'Bientôt rempli avec vos créations.\n\n' +
            '\n\n' +
            '🌾'
        );
    },

    'roadmap-farmer-league': async (channel) => {
        await channel.send({
            embeds: [new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('📊 Roadmap Farmer League')
                .setDescription(
                    '**Transparence totale sur notre progression**\n\n' +
                    '**Phase 1 - Construction Communauté** ✅ EN COURS\n' +
                    '• Recruter 50 farmers pionniers\n' +
                    '• Lancer défis hebdomadaires\n' +
                    '• Créer portfolio collectif\n\n' +
                    '**Phase 2 - Acquisition Clients** 🔄 BIENTÔT\n' +
                    '• Prospecter 10+ clients potentiels\n' +
                    '• Négocier premiers contrats\n\n' +
                    '**Phase 3 - Lancement Missions** 🎯 OBJECTIF\n' +
                    '• Distribuer premières missions payées\n' +
                    '• Pionniers en priorité absolue\n\n' +
                    '**Updates postés ici chaque semaine.**'
                )
            ]
        });
    },

    'défis-hebdomadaires': async (channel) => {
        await channel.send(
            '🎯 **DÉFIS HEBDOMADAIRES**\n\n' +
            '\n\n' +
            'Défis créatifs chaque lundi.\n\n' +
            '**FORMAT**\n\n' +
            '→ Thème de la semaine\n' +
            '→ Contraintes créatives\n' +
            '→ Points à gagner\n\n' +
            '\n\n' +
            'Premier défi bientôt.\n\n' +
            '🌾'
        );
    },

    'parrainage': async (channel) => {
        await channel.send(
            '👥 **PARRAINAGE**\n\n' +
            '\n\n' +
            '**FONCTIONNEMENT**\n\n' +
            '1. Invite un monteur\n' +
            '2. Il rejoint avec /apply\n' +
            '3. Vous gagnez des points bonus\n\n' +
            '\n\n' +
            '**BONUS**\n\n' +
            '+50 pts → Parrain\n' +
            '+25 pts → Parrainé\n\n' +
            '\n\n' +
            '🌾'
        );
    },

    'tournois': async (channel) => {
        await channel.send(
            '⚔️ **TOURNOIS MENSUELS**\n\n' +
            '\n\n' +
            'Tournoi créatif chaque mois.\n\n' +
            '**RÉCOMPENSES**\n\n' +
            '🥇 1er → 500 points + badge\n' +
            '🥈 2ème → 300 points\n' +
            '🥉 3ème → 200 points\n\n' +
            '\n\n' +
            'Prochain tournoi bientôt annoncé.\n\n' +
            '🌾'
        );
    },

    'missions-practice': async (channel) => {
        await channel.send(
            '📋 **ZONE ENTRAÎNEMENT**\n\n' +
            '\n\n' +
            'Missions pour développer tes skills.\n\n' +
            '**TYPES**\n\n' +
            '→ Hooks (3-5s)\n' +
            '→ Clips courts (15-30s)\n' +
            '→ Montages complets (1min+)\n\n' +
            '\n\n' +
            'Chaque mission = points.\n\n' +
            'Premières missions bientôt.\n\n' +
            '🌾'
        );
    },

    'ton-tableau-de-bord': async (channel) => {
        await channel.send(
            '📊 **TON TABLEAU DE BORD**\n\n' +
            '\n\n' +
            '**COMMANDES**\n\n' +
            '/stats\n' +
            '→ Progression complète\n' +
            '→ Points totaux\n' +
            '→ Niveau actuel\n' +
            '→ Prochaine étape\n\n' +
            '/leaderboard\n' +
            '→ Classement général\n\n' +
            '\n\n' +
            'Track ta progression.\n\n' +
            '🌾'
        );
    },

    'entraide-technique': async (channel) => {
        await channel.send(
            '💬 **ENTRAIDE TECHNIQUE**\n\n' +
            '\n\n' +
            'Questions montage vidéo ? Poste ici.\n\n' +
            '**RÈGLES**\n\n' +
            '→ Respect et constructivité\n' +
            '→ Partage tes connaissances\n' +
            '→ Entraide\n\n' +
            '\n\n' +
            'On progresse ensemble.\n\n' +
            '🌾'
        );
    },

    'ressources-gratuites': async (channel) => {
        await channel.send(
            '📖 **RESSOURCES GRATUITES**\n\n' +
            '\n\n' +
            '**BIENTÔT DISPONIBLE**\n\n' +
            '→ Musiques libres de droits\n' +
            '→ SFX et sound design\n' +
            '→ Templates After Effects\n' +
            '→ Presets de couleur\n' +
            '→ Tutoriels communautaires\n\n' +
            '\n\n' +
            'En construction.\n\n' +
            '🌾'
        );
    },

    'projets-disponibles': async (channel) => {
        await channel.send(
            '🎬 **PROJETS DISPONIBLES**\n\n' +
            '\n\n' +
            'Missions payées apparaîtront ici.\n\n' +
            '**QUAND ?**\n\n' +
            'Dès que clients arrivent.\n' +
            'Pionniers prioritaires.\n\n' +
            '\n\n' +
            'Commande : /mission list\n\n' +
            '🌾'
        );
    },

    'projets-en-cours': async (channel) => {
        await channel.send(
            '🔄 **PROJETS EN COURS**\n\n' +
            '\n\n' +
            'Update tes missions en cours ici.\n\n' +
            '**FORMAT SUGGÉRÉ**\n\n' +
            '🎬 Mission #[ID]\n' +
            '📊 Progression: [%]\n' +
            '⏰ Deadline: [Date]\n\n' +
            '\n\n' +
            '🌾'
        );
    },

    'projets-en-validation': async (channel) => {
        await channel.send(
            '✅ **EN VALIDATION**\n\n' +
            '\n\n' +
            'Clips soumis sont validés ici.\n\n' +
            '**DÉLAI**\n\n' +
            'Standard : 12-24h\n' +
            'Urgent : 2-6h\n\n' +
            '\n\n' +
            'Notification en DM dès validation.\n\n' +
            '🌾'
        );
    },

    'projets-publiés': async (channel) => {
        await channel.send(
            '🚀 **PROJETS PUBLIÉS**\n\n' +
            '\n\n' +
            'Wall of Fame.\n\n' +
            'Clips validés A ou A+ affichés ici.\n\n' +
            '\n\n' +
            'Bientôt rempli avec vos créations.\n\n' +
            '🌾'
        );
    },

    'compteur-gains': async (channel) => {
        await channel.send(
            '💵 **COMPTEUR GAINS**\n\n' +
            '\n\n' +
            '**COMMANDES**\n\n' +
            '/pay view\n' +
            '→ Voir tes gains\n\n' +
            '/pay request [montant] [méthode]\n' +
            '→ Demander retrait (min 50€)\n\n' +
            '\n\n' +
            '**MÉTHODE**\n\n' +
            '→ Crypto (24-48h)\n\n' +
            '\n\n' +
            'Actif quand missions payées commencent.\n\n' +
            '🌾'
        );
    },

    'bonus-et-badges': async (channel) => {
        await channel.send(
            '🏆 **BONUS ET BADGES**\n\n' +
            '\n\n' +
            '**BADGES DISPONIBLES**\n\n' +
            '🌾 Founding Member\n' +
            '🏆 Champion\n' +
            '⚡ Speed Demon\n' +
            '🎨 Style Master\n\n' +
            '\n\n' +
            'Gagne des badges en participant.\n\n' +
            '🌾'
        );
    },

    'salon-vip': async (channel) => {
        await channel.send(
            '💎 **SALON VIP ELITE**\n\n' +
            '\n\n' +
            'Bienvenue dans le cercle Elite.\n\n' +
            '**AVANTAGES**\n\n' +
            '→ Rémunération premium\n' +
            '→ Priorité absolue missions\n' +
            '→ Créateurs premium\n' +
            '→ Influence stratégique\n\n' +
            '\n\n' +
            'Elite = état d\'esprit.\n\n' +
            'Continue à dominer.\n\n' +
            '🌾'
        );
    },

    'missions-premium': async (channel) => {
        await channel.send(
            '🎯 **MISSIONS PREMIUM**\n\n' +
            '\n\n' +
            'Réservé aux Elite.\n\n' +
            '**CARACTÉRISTIQUES**\n\n' +
            '→ Rémunération supérieure\n' +
            '→ Projets confidentiels\n' +
            '→ Créateurs premium\n\n' +
            '\n\n' +
            'Deviens Elite pour débloquer.\n\n' +
            '🌾'
        );
    },

    'admin-général': async (channel) => {
        await channel.send(
            '📋 **ADMIN GÉNÉRAL**\n\n' +
            '\n\n' +
            'Command Center - Admins only.\n\n' +
            '**NOTIFICATIONS AUTO**\n\n' +
            '→ Nouvelles candidatures\n' +
            '→ Demandes paiement\n' +
            '→ Clips en validation\n' +
            '→ Alertes système\n\n' +
            '\n\n' +
            'Actions loggées en DB.\n\n' +
            '🌾'
        );
    },

    'stats-communauté': async (channel) => {
        await channel.send(
            '📊 **STATS COMMUNAUTÉ**\n\n' +
            '\n\n' +
            'Stats globales Farmer League.\n\n' +
            '**SUIVI**\n\n' +
            '→ Membres actifs\n' +
            '→ Clips produits\n' +
            '→ Taux progression\n' +
            '→ Top performers\n\n' +
            '\n\n' +
            'Updates hebdomadaires.\n\n' +
            '🌾'
        );
    },

    'acquisition-clients': async (channel) => {
        await channel.send(
            '💼 **ACQUISITION CLIENTS**\n\n' +
            '\n\n' +
            'Suivi prospection clients.\n\n' +
            '**TRACK**\n\n' +
            '→ Prospects contactés\n' +
            '→ Deals en négociation\n' +
            '→ Contrats signés\n\n' +
            '\n\n' +
            'Transparence totale.\n\n' +
            '🌾'
        );
    },

    'validation-projets': async (channel) => {
        await channel.send(
            '✅ **VALIDATION PROJETS**\n\n' +
            '\n\n' +
            'Queue de validation admin.\n\n' +
            '**COMMANDE**\n\n' +
            '/validate [id] [note] [feedback]\n\n' +
            '\n\n' +
            'Notes : A+, A, B, C, F\n\n' +
            '🌾'
        );
    }
};

module.exports = channelMessages;
