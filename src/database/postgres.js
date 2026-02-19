
const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔌 Tentative de connexion PostgreSQL: ${maskedUrl}`);

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10
    });

    pool.on('error', (err, client) => {
        console.error('❌ Erreur inattendue sur le client PG:', err);
    });
}

// Initialisation des tables
async function initPostgres() {
    if (!pool) return;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255),
                points INTEGER DEFAULT 0,
                level VARCHAR(50) DEFAULT 'rookie',
                clips_completed INTEGER DEFAULT 0,
                clips_validated INTEGER DEFAULT 0,
                total_earnings INTEGER DEFAULT 0,
                withdrawn_earnings INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                referral_link VARCHAR(255),
                referral_points INTEGER DEFAULT 0,
                referral_count INTEGER DEFAULT 0
            );
        `);

        // Social Accounts
        await client.query(`
            CREATE TABLE IF NOT EXISTS social_accounts (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                platform VARCHAR(50),
                handle VARCHAR(255),
                profile_link TEXT,
                followers INTEGER DEFAULT 0,
                tapit_link TEXT,
                declared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending_link',
                UNIQUE(platform, handle)
            );
        `);

        // Applications
        await client.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255),
                username VARCHAR(255),
                experience TEXT,
                portfolio TEXT,
                motivation TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP,
                reviewed_by VARCHAR(255)
            );
        `);

        // Missions
        await client.query(`
            CREATE TABLE IF NOT EXISTS missions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                description TEXT,
                type VARCHAR(50),
                payment INTEGER DEFAULT 0,
                deadline VARCHAR(50),
                status VARCHAR(50) DEFAULT 'available',
                assigned_to VARCHAR(255),
                created_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Submissions
        await client.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                mission_id INTEGER REFERENCES missions(id),
                user_id VARCHAR(255),
                clip_url TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                validated_at TIMESTAMP,
                grade VARCHAR(10),
                points_earned INTEGER DEFAULT 0,
                feedback TEXT,
                validated_by VARCHAR(255)
            );
        `);

        // Payments
        await client.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) REFERENCES users(user_id),
                amount INTEGER,
                method VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending',
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP,
                processed_by VARCHAR(255),
                transaction_id VARCHAR(255)
            );
        `);

        // Referrals
        await client.query(`
            CREATE TABLE IF NOT EXISTS referrals (
                id SERIAL PRIMARY KEY,
                referrer_id VARCHAR(255) REFERENCES users(user_id),
                referrer_username VARCHAR(255),
                referred_id VARCHAR(255),
                referred_username VARCHAR(255),
                invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending',
                points_earned INTEGER DEFAULT 0,
                invite_code VARCHAR(50),
                first_mission_at TIMESTAMP,
                validated_at TIMESTAMP
            );
        `);

        // Audit Logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                action_type VARCHAR(50),
                admin_id VARCHAR(255),
                admin_name VARCHAR(255),
                target_id VARCHAR(255),
                target_name VARCHAR(255),
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('COMMIT');
        console.log('✅ Tables PostgreSQL initialisées (Complètes).');

        // --- MIGRATION AUTOMATIQUE (SEEDING) ---
        // Vérifier si la table users est vide
        const userCountRes = await client.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(userCountRes.rows[0].count);

        if (userCount === 0) {
            console.log('🌱 Base de données vide. Démarrage du seeding...');
            try {
                const seedData = require('./seed');

                await client.query('BEGIN');

                // USERS
                for (const user of seedData.users) {
                    await client.query(`
                        INSERT INTO users (user_id, username, points, level, clips_completed, clips_validated, total_earnings, withdrawn_earnings, current_streak, last_activity, joined_at, referral_link, referral_points, referral_count)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        ON CONFLICT (user_id) DO NOTHING
                    `, [
                        user.user_id, user.username, user.points, user.level,
                        user.clips_completed, user.clips_validated, user.total_earnings,
                        user.withdrawn_earnings, user.current_streak,
                        user.last_activity, user.joined_at,
                        user.referral_link, user.referral_points, user.referral_count
                    ]);

                    // SOCIAL ACCOUNTS
                    if (user.socialAccounts) {
                        for (const acc of user.socialAccounts) {
                            await client.query(`
                                INSERT INTO social_accounts (user_id, platform, handle, profile_link, followers, tapit_link, declared_at, status, updated_at)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                                ON CONFLICT (platform, handle) DO NOTHING
                            `, [
                                user.user_id, acc.platform, acc.handle, acc.profileLink, acc.followers,
                                acc.tapitLink, acc.declaredAt, acc.status, acc.updatedAt
                            ]);
                        }
                    }
                }

                // APPLICATIONS
                if (seedData.applications) {
                    for (const app of seedData.applications) {
                        await client.query(`
                            INSERT INTO applications (id, user_id, username, experience, portfolio, motivation, status, applied_at, reviewed_at, reviewed_by)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            ON CONFLICT (id) DO NOTHING
                        `, [
                            app.id, app.user_id, app.username, app.experience, app.portfolio, app.motivation,
                            app.status, app.applied_at, app.reviewed_at, app.reviewed_by
                        ]);
                    }
                    // Reset sequence
                    await client.query("SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications))");
                }

                // MISSIONS
                if (seedData.missions) {
                    for (const m of seedData.missions) {
                        await client.query(`
                            INSERT INTO missions (id, title, description, type, payment, deadline, status, created_by, created_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                            ON CONFLICT (id) DO NOTHING
                        `, [
                            m.id, m.title, m.description, m.type, m.payment, m.deadline,
                            m.status, m.created_by, m.created_at
                        ]);
                    }
                    await client.query("SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions))");
                }

                // REFERRALS
                if (seedData.referrals) {
                    for (const r of seedData.referrals) {
                        await client.query(`
                            INSERT INTO referrals (id, referrer_id, referrer_username, referred_id, referred_username, invited_at, status, points_earned, invite_code, first_mission_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                            ON CONFLICT (id) DO NOTHING
                        `, [
                            r.id, r.referrer_id, r.referrer_username, r.referred_id, r.referred_username,
                            r.invited_at, r.status, r.points_earned, r.invite_code, r.first_mission_at
                        ]);
                    }
                    await client.query("SELECT setval('referrals_id_seq', (SELECT MAX(id) FROM referrals))");
                }

                await client.query('COMMIT');
                console.log('✅ Seeding terminé avec succès !');
            } catch (err) {
                await client.query('ROLLBACK');
                console.error("❌ Erreur seeding:", err);
            }
        }

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur initialisation PostgreSQL:', e);
    } finally {
        client.release();
    }
}

// --- Fonctions DB ---

// USERS
async function getUser(userId) {
    const res = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return res.rows[0] || null;
}

async function createUser(userId, username) {
    const query = `
        INSERT INTO users (user_id, username, joined_at, last_activity)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET last_activity = NOW()
        RETURNING *;
    `;
    const res = await pool.query(query, [userId, username]);
    return res.rows[0];
}

async function updateUserPoints(userId, points) {
    await pool.query('UPDATE users SET points = points + $1 WHERE user_id = $2', [points, userId]);
}

async function updateUserReferralStats(userId, pointsToAdd, countToAdd) {
    await pool.query(
        'UPDATE users SET referral_points = referral_points + $1, referral_count = referral_count + $2, points = points + $1 WHERE user_id = $3',
        [pointsToAdd, countToAdd, userId]
    );
}

async function updateUserLevel(userId, level) {
    await pool.query('UPDATE users SET level = $1 WHERE user_id = $2', [level, userId]);
}

async function updateUserEarnings(userId, amount) {
    await pool.query('UPDATE users SET total_earnings = total_earnings + $1 WHERE user_id = $2', [amount, userId]);
}

async function incrementClipsCompleted(userId) {
    await pool.query('UPDATE users SET clips_completed = clips_completed + 1 WHERE user_id = $1', [userId]);
}

async function getAllUsers() {
    const res = await pool.query('SELECT * FROM users ORDER BY points DESC');
    return res.rows;
}

async function getTopUsers(limit = 10) {
    const res = await pool.query('SELECT * FROM users ORDER BY points DESC LIMIT $1', [limit]);
    return res.rows;
}

// SOCIAL ACCOUNTS
async function getSocialAccounts(userId) {
    const res = await pool.query('SELECT * FROM social_accounts WHERE user_id = $1', [userId]);
    return res.rows.map(row => ({
        id: row.id.toString(),
        platform: row.platform,
        handle: row.handle,
        profileLink: row.profile_link,
        followers: row.followers,
        tapitLink: row.tapit_link,
        status: row.status,
        updatedAt: row.updated_at
    }));
}

async function addSocialAccount(userId, platform, handle, profileLink, followers) {
    const query = `
        INSERT INTO social_accounts (user_id, platform, handle, profile_link, followers, status, declared_at)
        VALUES ($1, $2, $3, $4, $5, 'pending_link', NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [userId, platform, handle, profileLink, followers]);
    const row = res.rows[0];
    return {
        id: row.id.toString(),
        platform: row.platform,
        handle: row.handle,
        profileLink: row.profile_link,
        followers: row.followers,
        status: row.status
    };
}

async function updateSocialAccount(userId, oldHandle, newPlatform, newHandle, newLink, newFollowers) {
    const query = `
        UPDATE social_accounts 
        SET platform = $1, handle = $2, profile_link = $3, followers = $4, status = 'pending_link', updated_at = NOW()
        WHERE user_id = $5 AND handle = $6
        RETURNING *;
    `;
    const res = await pool.query(query, [newPlatform, newHandle, newLink, newFollowers, userId, oldHandle]);
    return res.rows[0] ? true : false;
}

async function updateTapitLink(userId, platform, handle, tapitLink) {
    const query = `
        UPDATE social_accounts 
        SET tapit_link = $1, status = 'active'
        WHERE user_id = $2 AND platform = $3 AND handle = $4
        RETURNING *;
    `;
    const res = await pool.query(query, [tapitLink, userId, platform, handle]);
    return res.rows.length > 0;
}

async function removeSocialAccount(userId, platform, handle) {
    const query = `DELETE FROM social_accounts WHERE user_id = $1 AND platform = $2 AND handle = $3 RETURNING *`;
    const res = await pool.query(query, [userId, platform, handle]);
    return res.rows.length > 0;
}

async function getAllSocialAccounts() {
    const query = `
        SELECT u.user_id, u.username, 
               json_agg(json_build_object(
                   'platform', s.platform, 
                   'handle', s.handle, 
                   'profileLink', s.profile_link,
                   'followers', s.followers
               )) as accounts
        FROM users u
        JOIN social_accounts s ON u.user_id = s.user_id
        GROUP BY u.user_id, u.username;
    `;
    const res = await pool.query(query);
    return res.rows.map(row => ({
        userId: row.user_id,
        username: row.username,
        accounts: row.accounts
    }));
}

// APPLICATIONS
async function createApplication(userId, username, experience, portfolio, motivation) {
    const query = `
        INSERT INTO applications (user_id, username, experience, portfolio, motivation, status, applied_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [userId, username, experience, portfolio, motivation]);
    return res.rows[0];
}

async function getApplication(id) {
    const res = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function getPendingApplications() {
    const res = await pool.query("SELECT * FROM applications WHERE status = 'pending' ORDER BY applied_at ASC");
    return res.rows;
}

async function updateApplicationStatus(id, status, reviewerId) {
    const query = `
        UPDATE applications 
        SET status = $1, reviewed_at = NOW(), reviewed_by = $2
        WHERE id = $3;
    `;
    await pool.query(query, [status, reviewerId, id]);
}

async function getAllApplications() {
    const res = await pool.query('SELECT * FROM applications ORDER BY applied_at DESC');
    return res.rows;
}

// MISSIONS
async function createMission(title, description, type, payment, deadline, createdBy) {
    const query = `
        INSERT INTO missions (title, description, type, payment, deadline, status, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, 'available', $6, NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [title, description, type, payment, deadline, createdBy]);
    return res.rows[0];
}

async function getMission(id) {
    const res = await pool.query('SELECT * FROM missions WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function getAvailableMissions() {
    const res = await pool.query("SELECT * FROM missions WHERE status = 'available' ORDER BY created_at DESC");
    return res.rows;
}

async function assignMission(id, userId) {
    await pool.query("UPDATE missions SET status = 'assigned', assigned_to = $1 WHERE id = $2", [userId, id]);
}

async function completeMission(id) {
    await pool.query("UPDATE missions SET status = 'completed' WHERE id = $1", [id]);
}

// SUBMISSIONS
async function createSubmission(missionId, userId, clipUrl) {
    const query = `
        INSERT INTO submissions (mission_id, user_id, clip_url, submitted_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [missionId, userId, clipUrl]);
    return res.rows[0];
}

async function getSubmission(id) {
    const res = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function getPendingSubmissions() {
    const query = `
        SELECT s.*, m.title as mission_title, u.username 
        FROM submissions s
        JOIN missions m ON s.mission_id = m.id
        JOIN users u ON s.user_id = u.user_id
        WHERE s.grade IS NULL
        ORDER BY s.submitted_at ASC
    `;
    const res = await pool.query(query);
    return res.rows;
}

async function validateSubmission(id, grade, pointsEarned, feedback, validatedBy) {
    const query = `
        UPDATE submissions 
        SET grade = $1, points_earned = $2, feedback = $3, validated_by = $4, validated_at = NOW()
        WHERE id = $5
    `;
    await pool.query(query, [grade, pointsEarned, feedback, validatedBy, id]);
}

async function getUserSubmissions(userId) {
    const query = `
        SELECT s.*, m.title as mission_title
        FROM submissions s
        JOIN missions m ON s.mission_id = m.id
        WHERE s.user_id = $1
        ORDER BY s.submitted_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
}

// PAYMENTS
async function createPaymentRequest(userId, amount, method) {
    const query = `
        INSERT INTO payments (user_id, amount, method, status, requested_at)
        VALUES ($1, $2, $3, 'pending', NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [userId, amount, method]);
    return res.rows[0];
}

async function getPaymentRequest(id) {
    const res = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return res.rows[0] || null;
}

async function getPendingPayments() {
    const query = `
        SELECT p.*, u.username
        FROM payments p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.status = 'pending'
        ORDER BY p.requested_at ASC
    `;
    const res = await pool.query(query);
    return res.rows;
}

async function approvePayment(id, processedBy, transactionId) {
    const query = `
        UPDATE payments 
        SET status = 'approved', processed_by = $1, transaction_id = $2, processed_at = NOW()
        WHERE id = $3
    `;
    await pool.query(query, [processedBy, transactionId, id]);
}

async function getUserPayments(userId) {
    const res = await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY requested_at DESC', [userId]);
    return res.rows;
}

// REFERRALS
async function updateUserReferralLink(userId, inviteCode) {
    const query = `UPDATE users SET referral_link = $1 WHERE user_id = $2 RETURNING *`;
    const res = await pool.query(query, [inviteCode, userId]);
    return res.rows.length > 0;
}

async function getReferralsByUser(userId) {
    const res = await pool.query('SELECT * FROM referrals WHERE referrer_id = $1', [userId]);
    return res.rows;
}

async function getReferralByReferred(referredId) {
    const res = await pool.query('SELECT * FROM referrals WHERE referred_id = $1', [referredId]);
    return res.rows[0] || null;
}

async function createReferral(referrerId, referrerUsername, referredId, referredUsername, inviteCode) {
    const query = `
        INSERT INTO referrals (referrer_id, referrer_username, referred_id, referred_username, invite_code, status, invited_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [referrerId, referrerUsername, referredId, referredUsername, inviteCode]);
    return res.rows[0];
}

async function updateReferralStatus(id, status, pointsToAdd = 0) {
    let query = `UPDATE referrals SET status = $1, points_earned = points_earned + $2`;
    if (status === 'validated') {
        query += `, validated_at = NOW()`;
    }
    if (status === 'active') {
        query += `, first_mission_at = COALESCE(first_mission_at, NOW())`;
    }
    query += ` WHERE id = $3 RETURNING *`;

    const res = await pool.query(query, [status, pointsToAdd, id]);
    return res.rows.length > 0;
}

// AUDIT LOGS
async function createAuditLog(actionType, adminId, adminName, targetId, targetName, details) {
    const query = `
        INSERT INTO audit_logs (action_type, admin_id, admin_name, target_id, target_name, details, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
    `;
    await pool.query(query, [actionType, adminId, adminName, targetId, targetName, details]);
}

async function getRecentAuditLogs(limit = 50) {
    const res = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1', [limit]);
    return res.rows;
}

async function getAuditLogsByAdmin(adminId) {
    const res = await pool.query('SELECT * FROM audit_logs WHERE admin_id = $1 ORDER BY timestamp DESC', [adminId]);
    return res.rows;
}

async function getAuditLogsByAction(actionType) {
    const res = await pool.query('SELECT * FROM audit_logs WHERE action_type = $1 ORDER BY timestamp DESC', [actionType]);
    return res.rows;
}

module.exports = {
    initPostgres,
    getUser,
    createUser,
    updateUserPoints,
    updateUserLevel,
    updateUserEarnings,
    incrementClipsCompleted,
    updateUserReferralStats,
    getAllUsers,
    getTopUsers,
    getSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    updateTapitLink,
    removeSocialAccount,
    getAllSocialAccounts,
    createApplication,
    getApplication,
    getPendingApplications,
    updateApplicationStatus,
    getAllApplications,
    createMission,
    getMission,
    getAvailableMissions,
    assignMission,
    completeMission,
    createSubmission,
    getSubmission,
    getPendingSubmissions,
    validateSubmission,
    getUserSubmissions,
    createPaymentRequest,
    getPaymentRequest,
    getPendingPayments,
    approvePayment,
    getUserPayments,
    updateUserReferralLink,
    getReferralsByUser,
    getReferralByReferred,
    createReferral,
    updateReferralStatus,
    createAuditLog,
    getRecentAuditLogs,
    getAuditLogsByAdmin,
    getAuditLogsByAction,
    backupDatabase: () => true, // No-op
    saveDatabase: () => true // No-op
};
