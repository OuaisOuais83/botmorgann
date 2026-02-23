const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { Pool } = require('pg');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('🔧 Vérifier que le bot et la base de données fonctionnent'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const now = new Date().toISOString();
        const userId = interaction.user.id;
        const username = interaction.user.tag;

        try {
            // 1. Écrire dans la DB principale (JSON ou Postgres selon config)
            await db.createAuditLog('test_ping', userId, username, null, null, `Test à ${now}`);

            // 2. Compter les tests effectués
            const testLogs = await db.getAuditLogsByAction('test_ping');
            const totalTests = testLogs.length;

            // 3. Test PostgreSQL/Neon si DATABASE_URL est défini
            let neonStatus = '❌ Non configuré';
            if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
                try {
                    const pool = new Pool({
                        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
                        ssl: { rejectUnauthorized: true }
                    });
                    const client = await pool.connect();
                    await client.query(
                        `INSERT INTO audit_logs (action_type, admin_id, admin_name, details, timestamp) 
                         VALUES ($1, $2, $3, $4, NOW())`,
                        ['test_ping', userId, username, `Test Neon à ${now}`]
                    );
                    const countRes = await client.query(
                        `SELECT COUNT(*) FROM audit_logs WHERE action_type = 'test_ping'`
                    );
                    client.release();
                    await pool.end();
                    neonStatus = `✅ OK (${countRes.rows[0].count} tests enregistrés)`;
                } catch (pgErr) {
                    neonStatus = `❌ Erreur: ${pgErr.message}`;
                }
            }

            const embed = new EmbedBuilder()
                .setColor(config.colors?.success || 0x00ff00)
                .setTitle('🔧 Test de connexion')
                .setDescription('Tout fonctionne correctement.')
                .addFields(
                    { name: 'Discord', value: '✅ Bot connecté', inline: true },
                    { name: ' DB principale', value: '✅ Écriture OK', inline: true },
                    { name: ' PostgreSQL (Neon)', value: neonStatus, inline: true },
                    { name: '📊 Nombre total de tests', value: `${totalTests}`, inline: false },
                    { name: '🕐 Dernier test', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[/test] Erreur:', error);
            await interaction.editReply({
                content: `❌ Erreur: ${error.message}\n\nDB ou Discord a un souci.`,
                ephemeral: true
            });
        }
    }
};
