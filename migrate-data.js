
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initPostgres, createUser, createApplication, createMission, createSubmission, createPaymentRequest, createAuditLog, addSocialAccount, createReferral, updateUserPoints, updateUserLevel, updateUserEarnings, updateApplicationStatus, updateSocialAccount } = require('./src/database/postgres');
const { Pool } = require('pg');

const dbPath = path.join(__dirname, 'farmer_league_bot.json');

async function migrate() {
    console.log('🚀 Démarrage de la migration vers PostgreSQL...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL manquant ! Assurez-vous d\'avoir ajouté Postgres via Railway.');
        process.exit(1);
    }

    if (!fs.existsSync(dbPath)) {
        console.error('❌ Fichier JSON introuvable (rien à migrer).');
        process.exit(0);
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // 1. Initialiser les tables
    await initPostgres();

    // Connexion directe pour les IDs forcés (car mes fonctions génèrent des IDs auto)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // USERS
        console.log(`👤 Migration de ${data.users.length} utilisateurs...`);
        for (const user of data.users) {
            // Création de base
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
            if (user.socialAccounts && user.socialAccounts.length > 0) {
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
        console.log(`📝 Migration de ${data.applications.length} candidatures...`);
        for (const app of data.applications) {
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

        // MISSIONS
        console.log(`🎯 Migration de ${data.missions.length} missions...`);
        for (const m of data.missions) {
            await client.query(`
                INSERT INTO missions (id, title, description, type, payment, deadline, status, assigned_to, created_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING
            `, [
                m.id, m.title, m.description, m.type, m.payment, m.deadline,
                m.status, m.assigned_to, m.created_by, m.created_at
            ]);
        }
        await client.query("SELECT setval('missions_id_seq', (SELECT MAX(id) FROM missions))");

        // SUBMISSIONS
        console.log(`🎬 Migration de ${data.submissions.length} soumissions...`);
        for (const s of data.submissions) {
            await client.query(`
                INSERT INTO submissions (id, mission_id, user_id, clip_url, submitted_at, validated_at, grade, points_earned, feedback, validated_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING
            `, [
                s.id, s.mission_id, s.user_id, s.clip_url, s.submitted_at,
                s.validated_at, s.grade, s.points_earned, s.feedback, s.validated_by
            ]);
        }
        await client.query("SELECT setval('submissions_id_seq', (SELECT MAX(id) FROM submissions))");

        // PAYMENTS
        console.log(`💰 Migration de ${data.payments.length} paiements...`);
        for (const p of data.payments) {
            await client.query(`
                INSERT INTO payments (id, user_id, amount, method, status, requested_at, processed_at, processed_by, transaction_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO NOTHING
            `, [
                p.id, p.user_id, p.amount, p.method, p.status,
                p.requested_at, p.processed_at, p.processed_by, p.transaction_id
            ]);
        }
        await client.query("SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments))");

        // REFERRALS
        if (data.referrals) {
            console.log(`🤝 Migration de ${data.referrals.length} parrainages...`);
            for (const r of data.referrals) {
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

        // AUDIT LOGS
        console.log(`🔒 Migration de ${data.audit_logs.length} logs...`);
        for (const l of data.audit_logs) {
            await client.query(`
                INSERT INTO audit_logs (id, action_type, admin_id, admin_name, target_id, target_name, details, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING
            `, [
                l.id, l.action_type, l.admin_id, l.admin_name, l.target_id,
                l.target_name, l.details, l.timestamp
            ]);
        }
        await client.query("SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs))");

        await client.query('COMMIT');
        console.log('✅ MIGRATION RÉUSSIE !');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur lors de la migration:', e);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

migrate();
