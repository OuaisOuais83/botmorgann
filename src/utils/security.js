const URL = require('url');

/**
 * Module de sécurité pour le bot Casino
 * Gère la validation, le rate limiting et la protection contre les abus
 */

// Cache pour le rate limiting
const rateLimitCache = new Map();
const commandCooldowns = new Map();

/**
 * Valide une URL pour s'assurer qu'elle n'est pas malveillante
 * @param {string} urlString - L'URL à valider
 * @returns {Object} - {valid: boolean, reason: string}
 */
function validateURL(urlString) {
    try {
        const parsedUrl = new URL(urlString);

        // Liste blanche des domaines autorisés pour les clips
        const allowedDomains = [
            'youtube.com',
            'youtu.be',
            'drive.google.com',
            'dropbox.com',
            'vimeo.com',
            'streamable.com',
            'wetransfer.com',
            'mediafire.com'
        ];

        // Vérifier le protocole
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return { valid: false, reason: 'Protocole non autorisé. Utilise http:// ou https://' };
        }

        // Vérifier le domaine
        const hostname = parsedUrl.hostname.toLowerCase();
        const isAllowed = allowedDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            return {
                valid: false,
                reason: `Domaine non autorisé. Utilise: ${allowedDomains.join(', ')}`
            };
        }

        // Vérifier la longueur
        if (urlString.length > 500) {
            return { valid: false, reason: 'URL trop longue (max 500 caractères)' };
        }

        return { valid: true };

    } catch (error) {
        return { valid: false, reason: 'URL invalide ou mal formatée' };
    }
}

/**
 * Vérifie le rate limit pour un utilisateur sur une commande
 * @param {string} userId - ID de l'utilisateur
 * @param {string} commandName - Nom de la commande
 * @param {number} cooldownSeconds - Cooldown en secondes (défaut: 5)
 * @returns {Object} - {allowed: boolean, timeLeft: number}
 */
function checkRateLimit(userId, commandName, cooldownSeconds = 5) {
    const key = `${userId}-${commandName}`;
    const now = Date.now();

    if (rateLimitCache.has(key)) {
        const lastUse = rateLimitCache.get(key);
        const timePassed = (now - lastUse) / 1000;

        if (timePassed < cooldownSeconds) {
            return {
                allowed: false,
                timeLeft: Math.ceil(cooldownSeconds - timePassed)
            };
        }
    }

    rateLimitCache.set(key, now);

    // Nettoyer le cache toutes les 10 minutes
    if (rateLimitCache.size > 1000) {
        const cutoff = now - (10 * 60 * 1000);
        for (const [k, timestamp] of rateLimitCache.entries()) {
            if (timestamp < cutoff) {
                rateLimitCache.delete(k);
            }
        }
    }

    return { allowed: true, timeLeft: 0 };
}

/**
 * Cooldowns spécifiques par commande
 */
const commandCooldownDefaults = {
    'apply': 300,        // 5 minutes
    'mission': 3,        // 3 secondes
    'pay': 60,           // 1 minute
    'stats': 10,         // 10 secondes
    'leaderboard': 30,   // 30 secondes
    'validate': 5,       // 5 secondes
    'review': 5,         // 5 secondes
    'setup': 600         // 10 minutes
};

/**
 * Vérifie le cooldown pour une commande spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {string} commandName - Nom de la commande
 * @returns {Object} - {allowed: boolean, timeLeft: number}
 */
function checkCommandCooldown(userId, commandName) {
    const cooldown = commandCooldownDefaults[commandName] || 5;
    return checkRateLimit(userId, commandName, cooldown);
}

/**
 * Sanitize user input pour éviter les injections
 * @param {string} input - Input utilisateur
 * @returns {string} - Input nettoyé
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    // Limiter la longueur
    let sanitized = input.substring(0, 2000);

    // Retirer les caractères de contrôle dangereux
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    // Échapper les caractères markdown Discord potentiellement dangereux
    // (on garde certains pour permettre la formatation basique)
    sanitized = sanitized.replace(/@(everyone|here)/gi, '@\u200b$1');

    return sanitized.trim();
}

/**
 * Vérifie si un utilisateur a les permissions requises
 * @param {GuildMember} member - Membre du serveur
 * @param {string} requiredRole - Rôle requis ('admin', 'elite', etc.)
 * @returns {boolean}
 */
function hasRequiredRole(member, requiredRole) {
    if (!member || !member.roles) return false;

    // Admin a tous les droits
    if (member.permissions.has('Administrator')) return true;

    const config = require('../config');
    const roleName = config.roles[requiredRole]?.name;

    if (!roleName) return false;

    return member.roles.cache.some(role => role.name === roleName);
}

/**
 * Vérifie si un utilisateur peut effectuer une action admin
 * @param {GuildMember} member - Membre du serveur
 * @returns {boolean}
 */
function isAdmin(member) {
    return member && member.permissions.has('Administrator');
}

/**
 * Détecte un comportement suspect (spam, abus)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} actionType - Type d'action
 * @returns {Object} - {suspicious: boolean, reason: string}
 */
function detectSuspiciousBehavior(userId, actionType) {
    const key = `behavior-${userId}`;
    const now = Date.now();
    const timeWindow = 60000; // 1 minute

    if (!commandCooldowns.has(key)) {
        commandCooldowns.set(key, []);
    }

    const actions = commandCooldowns.get(key);

    // Nettoyer les actions hors de la fenêtre de temps
    const recentActions = actions.filter(a => now - a.timestamp < timeWindow);

    // Ajouter la nouvelle action
    recentActions.push({ type: actionType, timestamp: now });
    commandCooldowns.set(key, recentActions);

    // Détecter le spam (plus de 10 actions par minute)
    if (recentActions.length > 10) {
        return {
            suspicious: true,
            reason: 'Trop d\'actions en peu de temps (possible spam)'
        };
    }

    // Détecter les candidatures multiples
    const applicationAttempts = recentActions.filter(a => a.type === 'apply');
    if (applicationAttempts.length > 2) {
        return {
            suspicious: true,
            reason: 'Multiples tentatives de candidature'
        };
    }

    return { suspicious: false };
}

/**
 * Vérifie si un montant de paiement nécessite une double vérification
 * @param {number} amount - Montant en €
 * @returns {boolean}
 */
function requiresDoubleVerification(amount) {
    return amount >= 200;
}

/**
 * Nettoie le cache de rate limiting (à appeler périodiquement)
 */
function cleanupCaches() {
    const now = Date.now();
    const cutoff = now - (30 * 60 * 1000); // 30 minutes

    for (const [key, timestamp] of rateLimitCache.entries()) {
        if (timestamp < cutoff) {
            rateLimitCache.delete(key);
        }
    }

    for (const [key, actions] of commandCooldowns.entries()) {
        const recent = actions.filter(a => now - a.timestamp < 60000);
        if (recent.length === 0) {
            commandCooldowns.delete(key);
        } else {
            commandCooldowns.set(key, recent);
        }
    }
}

// Nettoyer les caches toutes les 5 minutes
setInterval(cleanupCaches, 5 * 60 * 1000);

module.exports = {
    validateURL,
    checkRateLimit,
    checkCommandCooldown,
    sanitizeInput,
    hasRequiredRole,
    isAdmin,
    detectSuspiciousBehavior,
    requiresDoubleVerification,
    cleanupCaches
};
