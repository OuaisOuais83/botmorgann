/**
 * Point d'entrée unique pour la base de données
 * Utilise PostgreSQL (Neon) si DATABASE_URL est défini, sinon JSON + Discord backup
 */
require('dotenv').config();

const usePostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

if (usePostgres) {
    console.log('📦 Base de données: PostgreSQL (Neon)');
    module.exports = require('./postgres');
} else {
    console.log('📦 Base de données: JSON + Discord backup');
    module.exports = require('./db');
}
