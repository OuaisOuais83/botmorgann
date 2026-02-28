/**
 * Database Entry Point
 * Système "Infaillible" : Stockage JSON Local + Sauvegarde Discord Instantanée
 * Source de Vérité : Canal Discord #sauvegarde-données
 */

const fs = require('fs');
const path = require('path');
const discordBackup = require('../utils/discordBackup');

const dbPath = path.join(__dirname, '..', '..', 'farmer_league_bot.json');
console.log('📂 DB PATH ABSOLU:', path.resolve(dbPath));

// Structure de la base de données en mémoire
let database = {
    users: [],
    applications: [],
    missions: [],
    submissions: [],
    payments: [],
    achievements: [],
    audit_logs: [],
    rate_limits: [],
    referrals: []
};

let discordClient = null;
let saveTimeout = null;

// Charger la base de données (Local)
function loadDatabaseLocal() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            database = JSON.parse(data);
            console.log('✅ Base de données locale chargée.');
            return true;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la DB locale:', error);
    }
    return false;
}

// Initialisation : Restauration depuis Discord (Priorité Absolue)
async function initDatabase(client) {
    discordClient = client;
    console.log('📊 Initialisation de la base de données (Discord-First)...');

    // 🔴 FORCE RESET: Supprimer la base de données locale pour éviter les conflits de volume persistant
    try {
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            console.log('🗑️ [RESET] Base de données locale supprimée pour garantir un état propre.');
        }
    } catch (e) {
        console.error('⚠️ [RESET] Impossible de supprimer la DB locale:', e.message);
    }

    // 1. Tenter de récupérer la dernière version sur Discord
    const discordData = await discordBackup.loadFromDiscord(client);

    if (discordData) {
        database = discordData;
        saveDatabaseLocal(); // Mettre à jour le fichier local immédiatement
        console.log('☁️ Base de données synchronisée depuis Discord.');
    } else {
        console.log('⚠️ Aucune sauvegarde Discord trouvée. Démarrage à neuf (Clean Slate).');
        // On ne charge PAS la version locale ici car on vient de la supprimer pour forcer le reset.
        saveDatabaseLocal(); // Créer un fichier vide
        triggerDiscordBackup(); // Initialiser le backup Discord
    }
}

// Sauvegarde Locale (Instantanée)
function saveDatabaseLocal() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    } catch (error) {
        console.error('Erreur sauvegarde locale:', error);
    }
}

// Sauvegarde Discord (Debounced 30s)
async function triggerDiscordBackup() {
    if (!discordClient) return;

    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
        console.log('☁️ Déclenchement sauvegarde Discord...');
        await discordBackup.saveToDiscord(discordClient, database);
        saveTimeout = null;
    }, 10000); // 10 secondes de délai pour regrouper les écritures
}

// Sauvegarde Globale (Appelée par les fonctions)
function saveDatabase() {
    saveDatabaseLocal();
    triggerDiscordBackup();
}

function backupDatabase() {
    // Le backup Discord gère ça maintenant, mais on garde pour compatibilité cron
    triggerDiscordBackup();
}

function getNextId(table) {
    if (!database[table] || database[table].length === 0) return 1;
    const ids = database[table].map(item => parseInt(item.id)).filter(id => !isNaN(id));
    if (ids.length === 0) return 1;
    return Math.max(...ids) + 1;
}

// --- Fonctions DB (Toutes ASYNC pour compatibilité) ---

const dbFunctions = {
    getUser: async (userId) => database.users.find(u => u.user_id === userId) || null,

    createUser: async (userId, username) => {
        const user = {
            user_id: userId,
            username: username,
            points: 0,
            level: 'rookie',
            clips_completed: 0,
            clips_validated: 0,
            total_earnings: 0,
            withdrawn_earnings: 0,
            current_streak: 0,
            last_activity: new Date().toISOString(),
            joined_at: new Date().toISOString(),
            socialAccounts: [],
            referral_link: null,
            referral_points: 0,
            referral_count: 0
        };
        database.users.push(user);
        saveDatabase();
        return user;
    },

    updateUserPoints: async (userId, points) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.points += points;
            saveDatabase();
        }
    },

    updateUserReferralStats: async (userId, pointsToAdd, countToAdd) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.referral_points = (user.referral_points || 0) + pointsToAdd;
            user.referral_count = (user.referral_count || 0) + countToAdd;
            user.points += pointsToAdd;
            saveDatabase();
        }
    },

    updateUserLevel: async (userId, level) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.level = level;
            saveDatabase();
        }
    },

    updateUserEarnings: async (userId, amount) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.total_earnings += amount;
            saveDatabase();
        }
    },

    incrementClipsCompleted: async (userId) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.clips_completed += 1;
            saveDatabase();
        }
    },

    getAllUsers: async () => database.users.sort((a, b) => b.points - a.points),

    getTopUsers: async (limit = 10) => database.users.sort((a, b) => b.points - a.points).slice(0, limit),

    getUsersWith10ClipsThisWeek: async () => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const byUser = new Map();
        for (const s of (database.submissions || [])) {
            if (s.validated_at && s.grade && s.grade !== 'F' && new Date(s.validated_at) >= weekAgo) {
                byUser.set(s.user_id, (byUser.get(s.user_id) || 0) + 1);
            }
        }
        return [...byUser.entries()].filter(([, count]) => count >= 10).map(([uid]) => uid);
    },

    getFoundingMembers: async () => {
        const foundingDate = new Date('2026-01-15');
        return (database.users || [])
            .filter(u => u.joined_at && new Date(u.joined_at) <= foundingDate)
            .map(u => u.user_id);
    },

    getTopUsersThisWeek: async (limit = 10) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const byUser = new Map();
        for (const s of (database.submissions || [])) {
            if (s.validated_at && s.grade && s.grade !== 'F' && new Date(s.validated_at) >= weekAgo) {
                const pts = (byUser.get(s.user_id) || 0) + (s.points_earned || 0);
                byUser.set(s.user_id, pts);
            }
        }
        return [...byUser.entries()]
            .map(([user_id, points]) => {
                const u = database.users.find(x => x.user_id === user_id);
                return u ? { ...u, points } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    },

    createApplication: async (userId, username, experience, portfolio, motivation, channelId = null) => {
        const app = {
            id: getNextId('applications'),
            user_id: userId,
            username: username,
            experience: experience,
            portfolio: portfolio,
            motivation: motivation,
            status: channelId ? 'ticket_open' : 'pending',
            applied_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            channel_id: channelId
        };
        database.applications.push(app);
        saveDatabase();
        return app;
    },

    createApplicationForOnboarding: async (userId, username) => {
        const app = {
            id: getNextId('applications'),
            user_id: userId,
            username: username,
            experience: null,
            portfolio: null,
            motivation: null,
            status: 'ticket_open',
            applied_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            channel_id: null
        };
        database.applications.push(app);
        saveDatabase();
        return app;
    },

    updateApplication: async (id, data) => {
        const app = database.applications.find(a => a.id === id);
        if (app) {
            if (data.experience != null) app.experience = data.experience;
            if (data.portfolio != null) app.portfolio = data.portfolio;
            if (data.motivation != null) app.motivation = data.motivation;
            if (data.status != null) app.status = data.status;
            if (data.channel_id !== undefined) app.channel_id = data.channel_id;
            saveDatabase();
        }
        return app;
    },

    getApplication: async (id) => database.applications.find(a => a.id === id) || null,

    getApplicationByChannelId: async (channelId) => database.applications.find(a => a.channel_id === channelId) || null,

    getPendingApplications: async () => database.applications.filter(a => a.status === 'pending').sort((a, b) => new Date(a.applied_at) - new Date(b.applied_at)),

    updateApplicationStatus: async (id, status, reviewerId) => {
        const app = database.applications.find(a => a.id === id);
        if (app) {
            app.status = status;
            app.reviewed_at = new Date().toISOString();
            app.reviewed_by = reviewerId;
            saveDatabase();
        }
    },

    getAllApplications: async () => database.applications.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)),

    createMission: async (title, description, type, payment, deadline, createdBy) => {
        const mission = {
            id: getNextId('missions'),
            title: title,
            description: description,
            type: type,
            payment: payment,
            deadline: deadline,
            status: 'available',
            assigned_to: null,
            created_by: createdBy,
            created_at: new Date().toISOString()
        };
        database.missions.push(mission);
        saveDatabase();
        return mission;
    },

    getMission: async (id) => database.missions.find(m => m.id === id) || null,

    getAvailableMissions: async () => database.missions.filter(m => m.status === 'available').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),

    assignMission: async (id, userId) => {
        const mission = database.missions.find(m => m.id === id);
        if (mission) {
            mission.status = 'assigned';
            mission.assigned_to = userId;
            saveDatabase();
        }
    },

    completeMission: async (id) => {
        const mission = database.missions.find(m => m.id === id);
        if (mission) {
            mission.status = 'completed';
            saveDatabase();
        }
    },

    createSubmission: async (missionId, userId, clipUrl) => {
        const submission = {
            id: getNextId('submissions'),
            mission_id: missionId,
            user_id: userId,
            clip_url: clipUrl,
            submitted_at: new Date().toISOString(),
            validated_at: null,
            grade: null,
            points_earned: 0,
            feedback: null,
            validated_by: null
        };
        database.submissions.push(submission);
        saveDatabase();
        return submission;
    },

    getSubmission: async (id) => database.submissions.find(s => s.id === id) || null,

    getPendingSubmissions: async () => {
        return database.submissions
            .filter(s => !s.grade)
            .map(s => {
                const mission = database.missions.find(m => m.id === s.mission_id);
                const user = database.users.find(u => u.user_id === s.user_id);
                return {
                    ...s,
                    mission_title: mission?.title || 'Unknown',
                    username: user?.username || 'Unknown'
                };
            })
            .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    },

    validateSubmission: async (id, grade, pointsEarned, feedback, validatedBy) => {
        const submission = database.submissions.find(s => s.id === id);
        if (submission) {
            submission.grade = grade;
            submission.points_earned = pointsEarned;
            submission.feedback = feedback;
            submission.validated_at = new Date().toISOString();
            submission.validated_by = validatedBy;
            saveDatabase();
        }
    },

    getUserSubmissions: async (userId) => {
        return database.submissions
            .filter(s => s.user_id === userId)
            .map(s => {
                const mission = database.missions.find(m => m.id === s.mission_id);
                return {
                    ...s,
                    mission_title: mission?.title || 'Unknown'
                };
            })
            .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    },

    createPaymentRequest: async (userId, amount, method) => {
        const payment = {
            id: getNextId('payments'),
            user_id: userId,
            amount: amount,
            method: method,
            status: 'pending',
            requested_at: new Date().toISOString(),
            processed_at: null,
            processed_by: null,
            transaction_id: null
        };
        database.payments.push(payment);
        saveDatabase();
        return payment;
    },

    getPaymentRequest: async (id) => database.payments.find(p => p.id === id) || null,

    getPendingPayments: async () => {
        return database.payments
            .filter(p => p.status === 'pending')
            .map(p => {
                const user = database.users.find(u => u.user_id === p.user_id);
                return {
                    ...p,
                    username: user?.username || 'Unknown'
                };
            })
            .sort((a, b) => new Date(a.requested_at) - new Date(b.requested_at));
    },

    approvePayment: async (id, processedBy, transactionId) => {
        const payment = database.payments.find(p => p.id === id);
        if (payment) {
            payment.status = 'approved';
            payment.processed_at = new Date().toISOString();
            payment.processed_by = processedBy;
            payment.transaction_id = transactionId;
            saveDatabase();
        }
    },

    getUserPayments: async (userId) => database.payments.filter(p => p.user_id === userId).sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at)),

    createAuditLog: async (actionType, adminId, adminName, targetId, targetName, details) => {
        const log = {
            id: getNextId('audit_logs'),
            action_type: actionType,
            admin_id: adminId,
            admin_name: adminName,
            target_id: targetId,
            target_name: targetName,
            details: details,
            timestamp: new Date().toISOString()
        };
        database.audit_logs.push(log);
        saveDatabase();
        return log;
    },

    getRecentAuditLogs: async (limit = 50) => database.audit_logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit),
    getAuditLogsByAdmin: async (adminId) => database.audit_logs.filter(log => log.admin_id === adminId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    getAuditLogsByAction: async (actionType) => database.audit_logs.filter(log => log.action_type === actionType).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),

    addSocialAccount: async (userId, platform, handle, profileLink, followers = 0) => {
        const user = database.users.find(u => u.user_id === userId);
        if (!user) return null;
        if (!user.socialAccounts) user.socialAccounts = [];
        const exists = user.socialAccounts.some(acc => acc.platform === platform && acc.handle === handle);
        if (exists) throw new Error('Ce compte existe déjà');
        const account = {
            id: Date.now().toString(),
            platform, handle: handle.startsWith('@') ? handle : `@${handle}`, profileLink, followers,
            tapitLink: null, declaredAt: new Date().toISOString(), status: 'pending_link'
        };
        user.socialAccounts.push(account);
        saveDatabase();
        return account;
    },

    getSocialAccounts: async (userId) => {
        const user = database.users.find(u => u.user_id === userId);
        return user ? (user.socialAccounts || []) : [];
    },

    updateSocialAccount: async (userId, oldHandle, newPlatform, newHandle, newLink, newFollowers) => {
        const user = database.users.find(u => u.user_id === userId);
        if (!user || !user.socialAccounts) return false;
        const accountIndex = user.socialAccounts.findIndex(acc => acc.handle === oldHandle);
        if (accountIndex === -1) return false;
        user.socialAccounts[accountIndex].platform = newPlatform;
        user.socialAccounts[accountIndex].handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
        user.socialAccounts[accountIndex].profileLink = newLink;
        user.socialAccounts[accountIndex].followers = newFollowers;
        user.socialAccounts[accountIndex].status = 'pending_link';
        user.socialAccounts[accountIndex].updatedAt = new Date().toISOString();
        saveDatabase();
        return user.socialAccounts[accountIndex];
    },

    updateTapitLink: async (userId, platform, handle, tapitLink) => {
        const user = database.users.find(u => u.user_id === userId);
        if (!user || !user.socialAccounts) return false;
        const account = user.socialAccounts.find(acc => acc.platform === platform && acc.handle === handle);
        if (account) {
            account.tapitLink = tapitLink;
            account.status = 'active';
            saveDatabase();
            return true;
        }
        return false;
    },

    removeSocialAccount: async (userId, platform, handle) => {
        const user = database.users.find(u => u.user_id === userId);
        if (!user || !user.socialAccounts) return false;
        const initialLength = user.socialAccounts.length;
        user.socialAccounts = user.socialAccounts.filter(acc => !(acc.platform === platform && acc.handle === handle));
        if (user.socialAccounts.length < initialLength) {
            saveDatabase();
            return true;
        }
        return false;
    },

    getAllSocialAccounts: async () => {
        const accounts = [];
        database.users.forEach(user => {
            if (user.socialAccounts && user.socialAccounts.length > 0) {
                accounts.push({ userId: user.user_id, username: user.username, accounts: user.socialAccounts });
            }
        });
        return accounts;
    },

    getAffiliationDashboardData: async () => {
        return (database.users || []).map(u => ({
            userId: u.user_id,
            username: u.username,
            referralCount: u.referral_count || 0,
            referralPoints: u.referral_points || 0,
            totalEarnings: u.total_earnings || 0,
            accounts: (u.socialAccounts || []).map(a => ({
                platform: a.platform,
                handle: a.handle,
                tapitLink: a.tapitLink,
                status: a.status
            }))
        })).sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
    },

    updateUserReferralLink: async (userId, inviteCode) => {
        const user = database.users.find(u => u.user_id === userId);
        if (user) {
            user.referral_link = inviteCode;
            saveDatabase();
            return true;
        }
        return false;
    },

    getReferralsByUser: async (userId) => (database.referrals || []).filter(r => r.referrer_id === userId),
    getReferralByReferred: async (referredId) => (database.referrals || []).find(r => r.referred_id === referredId) || null,

    createReferral: async (referrerId, referrerUsername, referredId, referredUsername, inviteCode) => {
        if (!database.referrals) database.referrals = [];
        const referral = {
            id: getNextId('referrals'),
            referrer_id: referrerId,
            referrer_username: referrerUsername,
            referred_id: referredId,
            referred_username: referredUsername,
            invited_at: new Date().toISOString(),
            status: 'pending',
            points_earned: 0,
            invite_code: inviteCode,
            first_mission_at: null
        };
        database.referrals.push(referral);
        saveDatabase();
        return referral;
    },

    updateReferralStatus: async (id, status, pointsToAdd = 0) => {
        if (!database.referrals) return false;
        const referral = database.referrals.find(r => r.id === id);
        if (referral) {
            referral.status = status;
            referral.points_earned += pointsToAdd;
            if (status === 'validated') referral.validated_at = new Date().toISOString();
            if (status === 'active' && !referral.first_mission_at) referral.first_mission_at = new Date().toISOString();
            saveDatabase();
            return true;
        }
        return false;
    },

    resetAll: async () => {
        console.log('🧹 RESET CHIRURGICAL: Suppression uniquement des comptes sociaux...');

        // 1. Nettoyer les comptes sociaux de chaque utilisateur
        if (database.users) {
            database.users.forEach(user => {
                user.socialAccounts = [];
                user.referral_count = 0; // On reset aussi les stats liées aux comptes/invites
                // On garde les points, XP, candidatures etc.
            });
        }

        // 2. Reset des referrals car ils sont liés aux comptes déclarés
        database.referrals = [];

        saveDatabase();
        return true;
    }
};

module.exports = {
    initDatabase,
    backupDatabase,
    saveDatabase,
    ...dbFunctions
};
