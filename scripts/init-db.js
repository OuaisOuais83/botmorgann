#!/usr/bin/env node
/**
 * Script d'initialisation de la base PostgreSQL (Neon/Vercel Postgres)
 * Crée toutes les tables selon le schéma du projet.
 * 
 * Usage: node scripts/init-db.js
 * Prerequis: DATABASE_URL dans .env ou variables d'environnement
 */

require('dotenv').config();

const { Pool } = require('pg');

async function initDatabase() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!dbUrl) {
        console.error('❌ DATABASE_URL ou POSTGRES_URL manquant dans .env');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: true },
        connectionTimeoutMillis: 10000
    });

    const client = await pool.connect();

    try {
        console.log('📦 Création des tables...\n');

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
        console.log('   ✅ users');

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
        console.log('   ✅ social_accounts');

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
        console.log('   ✅ applications');

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
        console.log('   ✅ missions');

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
        console.log('   ✅ submissions');

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
        console.log('   ✅ payments');

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
        console.log('   ✅ referrals');

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
        console.log('   ✅ audit_logs');

        // Rate Limits (optionnel)
        await client.query(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                key VARCHAR(255) PRIMARY KEY,
                count INTEGER DEFAULT 0,
                reset_at TIMESTAMP
            );
        `);
        console.log('   ✅ rate_limits');

        console.log('\n✅ Base de données initialisée avec succès.');
        console.log('   Tu peux maintenant démarrer le bot avec DATABASE_URL configuré.\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

initDatabase();
