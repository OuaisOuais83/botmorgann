const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Contenu détaillé pour chaque canal du serveur Casino
 * Messages alignés avec la vision Andrew Tate / Farmer League
 */

const channelContent = {
    // ========== BIENVENUE ==========
    'accueil': {
        title: '🌾 BIENVENUE DANS LA CASINO EMPIRE ACADEMY',
        messages: [
            {
                embed: true,
                color: config.colors.primary,
                content: {
                    title: '👋 BIENVENUE DANS L\'ÉLITE',
                    description:
                        '**Tu viens d\'entrer dans le cercle des winners.**\n\n' +
                        'Ici, on ne perd pas de temps. On produit, on gagne, on domine.\n\n' +
                        '**🎯 Notre mission:**\n' +
                        'Transformer des monteurs talentueux en machines à cash grâce au contenu viral.\n\n' +
                        '**💎 Ce qui t\'attend:**\n' +
                        '✅ Missions payées quotidiennes\n' +
                        '✅ Système de progression clair (Rookie → Elite)\n' +
                        '✅ Paiements rapides et fiables\n' +
                        '✅ Communauté de winners motivés\n' +
                        '✅ Formation continue\n\n' +
                        '**📋 Prochaines étapes:**\n' +
                        '1. Lis les <#RULES_CHANNEL>\n' +
                        '2. Regarde les <#EXAMPLES_CHANNEL>\n' +
                        '3. Utilise `/apply` pour postuler\n\n' +
                        '**Welcome to Farmer League. Let\'s dominate. 💪**',
                    footer: 'Excellence ou rien.'
                }
            }
        ]
    },

    'règles-et-vision': {
        title: '📜 RÈGLES & VISION',
        messages: [
            {
                embed: true,
                color: 0xFF0000,
                content: {
                    title: '⚠️ RÈGLES DU SERVEUR - À LIRE ABSOLUMENT',
                    description:
                        '**Ces règles ne sont pas négociables. Aucune exception.**\n\n' +
                        '**1️⃣ RESPECT & PROFESSIONNALISME**\n' +
                        '• Pas de drama, pas d\'excuses, que des résultats\n' +
                        '• Respect total envers les membres et admins\n' +
                        '• Conflits = DM ou ticket, pas dans les salons publics\n\n' +
                        '**2️⃣ QUALITÉ AVANT TOUT**\n' +
                        '• Chaque clip doit être au top niveau\n' +
                        '• Pas de rush = pas de quality\n' +
                        '• Un clip médiocre = warning, 3 warnings = kick\n\n' +
                        '**3️⃣ DEADLINES = SACRÉ**\n' +
                        '• Tu prends une mission = tu la finis à temps\n' +
                        '• Problème ? Préviens 24h AVANT la deadline\n' +
                        '• Retard non justifié = pénalité de points\n\n' +
                        '**4️⃣ COMMUNICATION**\n' +
                        '• Réponse aux admins dans les 12h\n' +
                        '• Updates réguliers sur tes missions\n' +
                        '• Fantôme = exclusion immédiate\n\n' +
                        '**5️⃣ ZÉRO TOLÉRANCE**\n' +
                        '• Plagiat / vol de contenu = ban permanent\n' +
                        '• Spam / pub non autorisée = ban\n' +
                        '• Leak d\'infos confidentielles = ban + poursuites',
                    footer: 'Ces règles garantissent l\'excellence de notre Farmer League.'
                }
            },
            {
                embed: true,
                color: config.colors.primary,
                content: {
                    title: '🎯 NOTRE VISION',
                    description:
                        '**Farmer League n\'est pas un serveur Discord ordinaire.**\n\n' +
                        'C\'est une machine de guerre pour créer les meilleurs monteurs de contenu viral du game.\n\n' +
                        '**💎 LA PHILOSOPHIE:**\n' +
                        '• L\'excellence n\'est pas une option, c\'est le minimum\n' +
                        '• La vitesse + qualité = domination\n' +
                        '• Plus tu produis, plus tu gagnes. C\'est simple.\n' +
                        '• Les excuses ne payent pas les factures\n\n' +
                        '**📈 LE SYSTÈME:**\n' +
                        '🥉 **Rookie** - Tu apprends les bases (10€/clip)\n' +
                        '🥈 **Hustler** - Tu comprends le jeu (15€/clip)\n' +
                        '🥇 **Grinder** - Tu domines (20€/clip + commissions)\n' +
                        '💎 **Elite** - Tu es une légende (30€/clip + avantages VIP)\n\n' +
                        '**🔥 L\'OBJECTIF:**\n' +
                        'Créer 100+ clips viraux par mois qui génèrent des millions de vues et transforment des spectateurs en joueurs.\n\n' +
                        '**Si tu n\'es pas prêt à grind, cette Farmer League n\'est pas pour toi.**\n' +
                        '**Si tu veux dominer, bienvenue dans l\'Empire.**',
                    footer: 'Built different. Stay hungry. 🚀'
                }
            }
        ]
    },

    'exemples-clips': {
        title: '🎬 EXEMPLES DE CLIPS',
        messages: [
            {
                embed: true,
                color: config.colors.primary,
                content: {
                    title: '✨ CLIPS DE RÉFÉRENCE - CE QU\'ON ATTEND',
                    description:
                        '**Ces exemples représentent le niveau minimum acceptable.**\n\n' +
                        '**🎬 CARACTÉRISTIQUES D\'UN BON CLIP CASINO:**\n\n' +
                        '**VISUEL:**\n' +
                        '✅ Transitions rapides et smooth (max 2-3 sec par scène)\n' +
                        '✅ Couleurs saturées et vibrantes (viral aesthetic)\n' +
                        '✅ Texte lisible avec animations dynamiques\n' +
                        '✅ Effets visuels qui captent l\'attention (glows, shakes)\n\n' +
                        '**AUDIO:**\n' +
                        '✅ Musique tendance et énergique\n' +
                        '✅ Sound design impactant (wins, spins, notifications)\n' +
                        '✅ Voix-off claire si nécessaire\n' +
                        '✅ Pas de silence mort\n\n' +
                        '**STRUCTURE:**\n' +
                        '✅ Hook dans les 3 premières secondes\n' +
                        '✅ Montée de tension\n' +
                        '✅ Climax émotionnel (big win, suspense)\n' +
                        '✅ Call-to-action clair à la fin\n\n' +
                        '**📊 CATÉGORIES DE CLIPS:**\n' +
                        '• **Express (5-15s)** - TikTok/Reels ultra-rapides\n' +
                        '• **Standard (30-60s)** - YouTube Shorts/Stories\n' +
                        '• **Premium (1-3min)** - Contenu long-form\n' +
                        '• **Compilation (5-10min)** - Best-of mensuel\n\n' +
                        '**⚠️ ERREURS À ÉVITER:**\n' +
                        '❌ Clips trop longs et ennuyeux\n' +
                        '❌ Audio de mauvaise qualité\n' +
                        '❌ Pas d\'énergie / pas d\'émotion\n' +
                        '❌ Copier-coller sans créativité\n\n' +
                        '**📥 RESSOURCES:**\n' +
                        'Les admins posteront régulièrement des exemples ici.\n' +
                        'Analyse, déconstruit, améliore.',
                    footer: 'Study the best. Become better. 💎'
                }
            }
        ]
    },

    'rejoindre-elite': {
        title: '💎 COMMENT REJOINDRE L\'ELITE',
        messages: [
            {
                embed: true,
                color: config.colors.elite,
                content: {
                    title: '👑 LE CHEMIN VERS L\'ELITE',
                    description:
                        '**Elite n\'est pas un titre. C\'est un état d\'esprit.**\n\n' +
                        '**📊 PROGRESSION DU SYSTÈME:**\n\n' +
                        '**🥉 ROOKIE (0-500 pts)**\n' +
                        '• Tarif: 10€/clip\n' +
                        '• Limite: 1 mission/jour\n' +
                        '• Focus: Apprendre les standards\n' +
                        '• Durée moyenne: 2-4 semaines\n\n' +
                        '**🥈 HUSTLER (501-2000 pts)**\n' +
                        '• Tarif: 15€/clip\n' +
                        '• Limite: 3 missions/jour\n' +
                        '• Focus: Vitesse + qualité\n' +
                        '• Durée moyenne: 1-2 mois\n\n' +
                        '**🥇 GRINDER (2001-5000 pts)**\n' +
                        '• Tarif: 20€/clip\n' +
                        '• Limite: 5 missions/jour\n' +
                        '• Bonus: 0.5€/10K vues\n' +
                        '• Focus: Volume + performance\n' +
                        '• Durée moyenne: 2-3 mois\n\n' +
                        '**💎 ELITE (5001+ pts)**\n' +
                        '• Tarif: 30€/clip\n' +
                        '• Limite: Aucune\n' +
                        '• Bonus: 1€/10K vues\n' +
                        '• Avantages VIP:\n' +
                        '  - Accès salon VIP exclusif\n' +
                        '  - Missions premium prioritaires\n' +
                        '  - Influence sur la direction de l\'Farmer League\n' +
                        '  - Bonus mensuels de performance\n\n' +
                        '**🎯 COMMENT GAGNER DES POINTS:**\n' +
                        '• Clip validé note B: +100 pts\n' +
                        '• Clip validé note A: +125 pts\n' +
                        '• Clip validé note A+: +175 pts\n' +
                        '• Clip < 6h: +50 pts bonus vitesse\n' +
                        '• Clip viral (100K+ vues): +500 pts\n' +
                        '• Streak quotidien: +25 pts/jour\n' +
                        '• Parrainage: +200 pts\n\n' +
                        '**💪 LE SECRET:**\n' +
                        'Grind. Consistency. Excellence.\n' +
                        'Il n\'y a pas de raccourci.\n\n' +
                        'Les Elites ne sont pas nés Elite.\n' +
                        'Ils ont grind jusqu\'à le devenir.',
                    footer: 'Your rank is earned, not given. 👑'
                }
            }
        ]
    },

    'témoignages': {
        title: '🔥 TÉMOIGNAGES',
        messages: [
            {
                embed: false,
                content:
                    '**Ce canal sera rempli par les témoignages de nos monteurs à succès.**\n\n' +
                    '💬 Si tu as atteint Elite ou un milestone important, partage ton histoire ici!\n\n' +
                    '**Format suggéré:**\n' +
                    '• Ton parcours (de Rookie à maintenant)\n' +
                    '• Ce que tu as appris\n' +
                    '• Tes conseils pour les nouveaux\n' +
                    '• Tes résultats (gains, clips viraux, etc.)\n\n' +
                    '**Les témoignages inspirent. L\'inspiration crée l\'action. L\'action génère les résultats.**'
            }
        ]
    },

    // ========== ROOKIE ZONE ==========
    'missions-débutant': {
        title: '📋 MISSIONS DÉBUTANT',
        messages: [
            {
                embed: true,
                color: config.colors.rookie,
                content: {
                    title: '🔰 ZONE ROOKIE - TES PREMIÈRES MISSIONS',
                    description:
                        '**Bienvenue Rookie! C\'est ici que ton voyage commence.**\n\n' +
                        '**📋 COMMENT FONCTIONNENT LES MISSIONS:**\n\n' +
                        '**1. VOIR LES MISSIONS**\n' +
                        '```\n/missions\n```\n' +
                        'Affiche toutes les missions disponibles avec détails.\n\n' +
                        '**2. PRENDRE UNE MISSION**\n' +
                        '```\n/mission claim [id]\n```\n' +
                        'Réserve la mission. Elle devient tienne.\n\n' +
                        '**3. SOUMETTRE TON CLIP**\n' +
                        '```\n/mission submit [id] [lien]\n```\n' +
                        'Upload sur YouTube/Drive et soumets le lien.\n\n' +
                        '**⚠️ RÈGLES ROOKIE:**\n' +
                        '• Maximum 1 mission à la fois\n' +
                        '• Deadline = sacré (généralement 24-48h)\n' +
                        '• Qualité > Vitesse au début\n' +
                        '• Demande de l\'aide si besoin!\n\n' +
                        '**🎯 TES OBJECTIFS:**\n' +
                        '✅ Compléter 5 clips = comprendre le process\n' +
                        '✅ Atteindre 500 pts = promotion Hustler\n' +
                        '✅ Maintenir un taux d\'acceptation >80%\n\n' +
                        '**💡 CONSEIL PRO:**\n' +
                        'Analyse les clips validés avec note A+.\n' +
                        'Copie la formule. Ajoute ta touche.\n\n' +
                        '**Les missions apparaîtront ici automatiquement. Let\'s go!**',
                    footer: 'Every expert was once a rookie. Start now. 🚀'
                }
            }
        ]
    },

    'tableau-de-bord': {
        title: '📊 TABLEAU DE BORD',
        messages: [
            {
                embed: true,
                color: config.colors.primary,
                content: {
                    title: '📈 TRACK TA PROGRESSION',
                    description:
                        '**Utilise ces commandes pour suivre ta performance:**\n\n' +
                        '**📊 TES STATS PERSONNELLES**\n' +
                        '```\n/my-stats\n```\n' +
                        'Affiche ton profil complet:\n' +
                        '• Niveau actuel\n' +
                        '• Points totaux\n' +
                        '• Clips complétés\n' +
                        '• Gains totaux\n' +
                        '• Streak actuel\n' +
                        '• Progression vers le prochain niveau\n\n' +
                        '**🏆 CLASSEMENT GÉNÉRAL**\n' +
                        '```\n/leaderboard\n```\n' +
                        'Top 10 des monteurs du serveur.\n\n' +
                        '**💰 TES GAINS**\n' +
                        '```\n/pay view\n```\n' +
                        'Voir tes gains disponibles et historique de paiements.\n\n' +
                        '**🎯 OBJECTIFS RECOMMANDÉS:**\n\n' +
                        '**Par Semaine:**\n' +
                        '• Rookies: 3-5 clips\n' +
                        '• Hustlers: 7-10 clips\n' +
                        '• Grinders: 15-20 clips\n' +
                        '• Elite: 20+ clips\n\n' +
                        '**Par Mois:**\n' +
                        '• Rookies: 15-20 clips / 150-200€\n' +
                        '• Hustlers: 30-40 clips / 450-600€\n' +
                        '• Grinders: 60-80 clips / 1200-1600€\n' +
                        '• Elite: 80-100 clips / 2400-3000€+\n\n' +
                        '**📊 Dashboard mis à jour en temps réel.**',
                    footer: 'Track, analyze, improve, dominate. 📈'
                }
            }
        ]
    },

    'motivation': {
        title: '💪 MOTIVATION',
        messages: [
            {
                embed: true,
                color: 0xFF6B00,
                content: {
                    title: '🔥 DAILY MOTIVATION',
                    description:
                        '**Ce canal reçoit des messages de motivation quotidiens à 8h.**\n\n' +
                        '**💎 MINDSET DU WINNER:**\n\n' +
                        '**1. L\'EXCUSE EST L\'ENNEMI**\n' +
                        'Pas de temps, pas de logiciel, pas d\'inspiration?\n' +
                        'Ce sont des excuses. Les winners trouvent des solutions.\n\n' +
                        '**2. LA CONSISTENCY BAT LE TALENT**\n' +
                        'Un clip par jour pendant 30 jours > 30 clips en 1 jour.\n' +
                        'Le grind constant crée les résultats exponentiels.\n\n' +
                        '**3. LA QUALITÉ N\'EST PAS NÉGOCIABLE**\n' +
                        'Un clip médiocre ne fait qu\'une chose: détruire ta réputation.\n' +
                        'Excellence ou rien. Pas de entre-deux.\n\n' +
                        '**4. LES RÉSULTATS PARLENT**\n' +
                        'Tes excuses ne payent pas tes factures.\n' +
                        'Seulstes clips validés génèrent du cash.\n\n' +
                        '**5. GRIND EN SILENCE**\n' +
                        'Moins tu parles, plus tu produis.\n' +
                        'Laisse tes résultats faire le bruit.\n\n' +
                        '**💪 CHALLENGE QUOTIDIEN:**\n' +
                        'Aujourd\'hui, produis un clip meilleur qu\'hier.\n' +
                        'Demain, surpasse aujourd\'hui.\n' +
                        'Répète pendant 365 jours.\n\n' +
                        '**Tu seras méconnaissable dans 1 an.**',
                    footer: 'Excellence is a habit, not an act. 💎'
                }
            }
        ]
    },

    // ========== PRODUCTION ==========
    'clips-disponibles': {
        title: '🎬 MISSIONS DISPONIBLES',
        messages: [
            {
                embed: false,
                content:
                    '**📢 LES NOUVELLES MISSIONS APPARAÎTRONT ICI AUTOMATIQUEMENT**\n\n' +
                    'Les admins postent les missions via `/mission create`.\n' +
                    'Tu seras notifié avec @here à chaque nouvelle mission!\n\n' +
                    '**Utilise `/missions` pour voir toutes les missions actives.**'
            }
        ]
    },

    'clips-en-cours': {
        title: '🔄 CLIPS EN COURS',
        messages: [
            {
                embed: false,
                content:
                    '**🔄 UPDATE SUR TES MISSIONS EN COURS**\n\n' +
                    'Si tu travailles sur une mission urgente ou complexe, poste un update ici:\n\n' +
                    '**Format suggéré:**\n' +
                    '```\n🎬 Mission #[ID] - [Titre]\n📊 Progression: [%]\n⏰ Deadline: [Date]\n💬 Status: [En cours / Problème / Presque fini]\n```\n\n' +
                    'Ça permet aux admins de tracker et d\'aider si nécessaire!'
            }
        ]
    },

    'clips-en-validation': {
        title: '✅ EN VALIDATION',
        messages: [
            {
                embed: false,
                content:
                    '**⏳ TES CLIPS SOUMIS SONT EN VALIDATION**\n\n' +
                    'Après avoir utilisé `/mission submit`, ton clip passe ici.\n\n' +
                    '**⏱️ DÉLAI DE VALIDATION:**\n' +
                    '• Standard: 12-24h\n' +
                    '• Urgent: 2-6h (si spécifié)\n\n' +
                    '**📊 CRITÈRES D\'ÉVALUATION:**\n' +
                    '• Respect du brief\n' +
                    '• Qualité technique (montage, audio, couleurs)\n' +
                    '• Créativité et impact\n' +
                    '• Hook et rétention\n\n' +
                    '**🏆 NOTES:**\n' +
                    '• **A+** = Perfection, viral potential (+175 pts)\n' +
                    '• **A** = Excellent, au-dessus des attentes (+125 pts)\n' +
                    '• **B** = Bon, publication OK (+100 pts)\n' +
                    '• **C** = Acceptable mais révisions recommandées (+75 pts)\n' +
                    '• **F** = Refusé, à refaire (0 pts)\n\n' +
                    '**Tu seras notifié en DM dès la validation!**'
            }
        ]
    },

    'clips-publiés': {
        title: '🚀 CLIPS PUBLIÉS',
        messages: [
            {
                embed: false,
                content:
                    '**🎉 WALL OF FAME - VOS CLIPS PUBLIÉS**\n\n' +
                    'Les clips validés avec note A ou A+ seront partagés ici!\n\n' +
                    '**Format:**\n' +
                    '```\n💎 Clip de @Monteur\n📊 Note: A+ (175 pts)\n🎬 Titre: [Titre]\n🔗 Lien: [URL]\n👁️ Vues: [à tracker]\n```\n\n' +
                    '**🔥 Si ton clip devient viral (100K+ vues), tu reçois +500 pts bonus!**\n\n' +
                    'Let\'s flood ce canal! 🚀'
            }
        ]
    },

    // ========== MONEY ZONE ==========
    'tes-gains': {
        title: '💵 TES GAINS',
        messages: [
            {
                embed: true,
                color: 0x00FF00,
                content: {
                    title: '💰 SYSTÈME DE PAIEMENT',
                    description:
                        '**L\'argent que tu gagnes est RÉEL. Pas de bullshit.**\n\n' +
                        '**💵 TARIFS PAR NIVEAU:**\n' +
                        '• Rookie: 10€/clip\n' +
                        '• Hustler: 15€/clip\n' +
                        '• Grinder: 20€/clip + 0.5€/10K vues\n' +
                        '• Elite: 30€/clip + 1€/10K vues\n\n' +
                        '**📤 DEMANDER UN RETRAIT:**\n' +
                        '```\n/pay view\n```\n' +
                        'Voir tes gains disponibles.\n\n' +
                        '```\n/pay request [montant] [méthode]\n```\n' +
                        'Demander un retrait (min 50€).\n\n' +
                        '**💳 MÉTHODES DE PAIEMENT:**\n' +
                        '• PayPal (le plus rapide)\n' +
                        '• Crypto (USDT/BTC)\n' +
                        '• Virement bancaire\n\n' +
                        '**⏱️ DÉLAIS:**\n' +
                        '• PayPal: 24-48h\n' +
                        '• Crypto: 12-24h\n' +
                        '• Virement: 3-5 jours\n\n' +
                        '**⚠️ RÈGLES:**\n' +
                        '• Minimum de retrait: 50€\n' +
                        '• Maximum 1 demande par semaine\n' +
                        '• Vérifie tes infos de paiement!\n\n' +
                        '**🔒 SÉCURITÉ:**\n' +
                        'Montants >200€ = double vérification admin.\n' +
                        'Tous les paiements sont trackés et vérifiables.',
                    footer: 'Get paid for your grind. Simple as that. 💵'
                }
            }
        ]
    },

    'bonus-performance': {
        title: '🏆 BONUS & PERFORMANCES',
        messages: [
            {
                embed: true,
                color: 0xFFD700,
                content: {
                    title: '🎁 SYSTÈME DE BONUS',
                    description:
                        '**En plus de ton tarif de base, gagne des bonus:**\n\n' +
                        '**⚡ BONUS VITESSE**\n' +
                        '+5€ si clip rendu en moins de 6h\n\n' +
                        '**🌟 BONUS QUALITÉ**\n' +
                        '• Note A: +5€\n' +
                        '• Note A+: +10€\n\n' +
                        '**🔥 BONUS VIRAL**\n' +
                        '• 100K vues: +50€\n' +
                        '• 500K vues: +150€\n' +
                        '• 1M vues: +300€\n\n' +
                        '**📅 BONUS STREAK**\n' +
                        '• 7 jours consécutifs: +25€\n' +
                        '• 30 jours consécutifs: +200€\n' +
                        '• 90 jours consécutifs: +500€\n\n' +
                        '**🏆 BONUS MENSUEL**\n' +
                        '• Top 1 du mois: +200€\n' +
                        '• Top 2 du mois: +150€\n' +
                        '• Top 3 du mois: +100€\n\n' +
                        '**💎 BONUS PARRAINAGE**\n' +
                        '+50€ par personne que tu recrutes et qui complète 10 clips.\n\n' +
                        '**🎯 OBJECTIF:**\n' +
                        'Certains monteurs Elite gagnent 4000-5000€/mois.\n' +
                        'Pas de limite. Juste ta capacité à grind.',
                    footer: 'Maximize your earnings. Maximize your grind. 💰'
                }
            }
        ]
    },

    // ========== ELITE CIRCLE ==========
    'salon-vip': {
        title: '💎 SALON VIP ELITE',
        messages: [
            {
                embed: true,
                color: config.colors.elite,
                content: {
                    title: '👑 BIENVENUE DANS LE CERCLE ELITE',
                    description:
                        '**Tu as atteint le sommet. Respect.**\n\n' +
                        '**💎 AVANTAGES ELITE:**\n\n' +
                        '**💰 FINANCIER:**\n' +
                        '• 30€ par clip (3x un Rookie)\n' +
                        '• 1€ par 10K vues (2x un Grinder)\n' +
                        '• Missions illimitées\n' +
                        '• Priorité absolue sur les missions premium\n' +
                        '• Bonus mensuels de performance\n\n' +
                        '**🎯 PRIVILÈGES:**\n' +
                        '• Accès aux projets confidentiels\n' +
                        '• Influence sur la stratégie de l\'Farmer League\n' +
                        '• Possibilité de former les Rookies (rémunéré)\n' +
                        '• Channel privé pour partager tips entre Elite\n\n' +
                        '**📊 RESPONSABILITÉS:**\n' +
                        '• Maintenir un standard d\'excellence\n' +
                        '• Être un exemple pour les niveaux inférieurs\n' +
                        '• Contribuer à l\'amélioration de l\'Farmer League\n\n' +
                        '**🔥 KEEP GRINDING:**\n' +
                        'Elite n\'est pas une destination. C\'est un mindset.\n' +
                        'Continue à dominer. Continue à innover.\n\n' +
                        '**Welcome to the top. Enjoy the view. 👑**',
                    footer: 'Elite is earned every single day. Never stop. 💎'
                }
            }
        ]
    },

    'missions-premium': {
        title: '🎯 MISSIONS PREMIUM',
        messages: [
            {
                embed: false,
                content:
                    '**🔥 MISSIONS PREMIUM - ELITE ONLY**\n\n' +
                    'Ces missions sont réservées aux membres Elite:\n\n' +
                    '**Caractéristiques:**\n' +
                    '• Paiement 2-3x supérieur\n' +
                    '• Projets confidentiels\n' +
                    '• Complexité élevée\n' +
                    '• Impact maximum\n\n' +
                    '**Les missions premium apparaîtront ici. Stay ready.**'
            }
        ]
    },

    // ========== MANAGEMENT ==========
    'admin-général': {
        title: '📋 ADMIN GÉNÉRAL',
        messages: [
            {
                embed: false,
                content:
                    '**🛠️ COMMAND CENTER - ADMINS ONLY**\n\n' +
                    'Ce canal est réservé aux discussions admin.\n\n' +
                    '**Notifications automatiques:**\n' +
                    '• Nouvelles candidatures\n' +
                    '• Demandes de paiement\n' +
                    '• Clips en validation\n' +
                    '• Alertes système\n\n' +
                    'Toutes les actions admin sont loggées dans la base de données pour sécurité.'
            }
        ]
    },

    'stats-équipe': {
        title: '📊 STATS ÉQUIPE',
        messages: [
            {
                embed: false,
                content:
                    '**📈 TABLEAU DE BORD ADMIN**\n\n' +
                    'Les stats de l\'équipe seront postées automatiquement tous les lundis:\n\n' +
                    '• Nombre total de monteurs actifs\n' +
                    '• Clips produits cette semaine\n' +
                    '• Taux d\'acceptation moyen\n' +
                    '• Revenu total généré\n' +
                    '• Top performers\n\n' +
                    'Utilisez ces données pour optimiser la production.'
            }
        ]
    },

    'validation-clips': {
        title: '✅ VALIDATION',
        messages: [
            {
                embed: false,
                content:
                    '**✅ QUEUE DE VALIDATION**\n\n' +
                    'Les clips soumis apparaîtront ici automatiquement.\n\n' +
                    '**Commandes admin:**\n' +
                    '```\n/validate [id] [note]\n```\n\n' +
                    '**Barème:**\n' +
                    '• A+ = Perfection absolue\n' +
                    '• A = Au-dessus des attentes\n' +
                    '• B = Standard acceptable\n' +
                    '• C = Besoin d\'améliorations\n' +
                    '• F = Refusé\n\n' +
                    'Toujours donner un feedback constructif!'
            }
        ]
    }
};

module.exports = channelContent;
