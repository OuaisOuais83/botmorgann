/**
 * Synchronisation des niveaux (Rookie → Elite) et badges
 * Vérifie les points de chaque utilisateur et assigne le rôle Discord correspondant.
 * Déclenché quotidiennement par cron.
 */
const config = require('../config');
const database = require('../database');

function calculateLevel(points) {
    if (points >= config.levels.elite.min) return 'elite';
    if (points >= config.levels.grinder.min) return 'grinder';
    if (points >= config.levels.hustler.min) return 'hustler';
    return 'rookie';
}

/**
 * Synchronise les rôles de niveau pour tous les membres
 * @param {import('discord.js').Client} client
 */
async function syncLevelsForAllUsers(client) {
    try {
        const users = await database.getAllUsers();
        let updated = 0;

        for (const guild of client.guilds.cache.values()) {
            for (const userData of users) {
                const targetLevel = calculateLevel(userData.points || 0);

                try {
                    const member = await guild.members.fetch(userData.user_id).catch(() => null);
                    if (!member) continue;

                    const newRole = guild.roles.cache.find(r => r.name === config.roles[targetLevel]?.name);
                    const hasNewRole = newRole && member.roles.cache.has(newRole.id);

                    if (!newRole) continue;
                    if (hasNewRole && userData.level === targetLevel) continue;

                    const oldLevelRoles = ['rookie', 'hustler', 'grinder', 'elite']
                        .filter(l => l !== targetLevel)
                        .map(l => guild.roles.cache.find(r => r.name === config.roles[l]?.name))
                        .filter(Boolean);

                    const needsUpdate = !hasNewRole || userData.level !== targetLevel;
                    if (needsUpdate) {
                        await member.roles.add(newRole);
                        for (const oldR of oldLevelRoles) {
                            if (member.roles.cache.has(oldR.id)) await member.roles.remove(oldR).catch(() => {});
                        }
                        await database.updateUserLevel(userData.user_id, targetLevel);
                        updated++;
                        console.log(`📊 [LEVEL SYNC] ${userData.username} → ${targetLevel}`);
                    }
                } catch (err) {
                    console.warn(`[LEVEL SYNC] Skip ${userData.user_id}:`, err.message);
                }
            }
        }

        if (updated > 0) {
            console.log(`✅ [LEVEL SYNC] ${updated} membres mis à jour`);
        }
        return updated;
    } catch (err) {
        console.error('❌ [LEVEL SYNC]', err);
        return 0;
    }
}

/**
 * Vérifie et assigne les badges (10 clips/semaine, Founding Member)
 * @param {import('discord.js').Client} client
 */
async function syncBadges(client) {
    try {
        const { getUsersWith10ClipsThisWeek, getFoundingMembers } = require('../database');
        let badgeCount = 0;

        const tenClipsUsers = await getUsersWith10ClipsThisWeek?.() || [];
        const foundingUsers = await getFoundingMembers?.() || [];

        for (const guild of client.guilds.cache.values()) {
            const badge10Clips = guild.roles.cache.find(r => r.name === config.roles.badge10Clips?.name || r.name?.includes('10 Clips'));
            const foundingRole = guild.roles.cache.find(r => r.name?.includes('Founding Member'));

            for (const userId of tenClipsUsers) {
                try {
                    const member = await guild.members.fetch(userId).catch(() => null);
                    if (member && badge10Clips && !member.roles.cache.has(badge10Clips.id)) {
                        await member.roles.add(badge10Clips);
                        badgeCount++;
                    }
                } catch (_) {}
            }

            for (const userId of foundingUsers) {
                try {
                    const member = await guild.members.fetch(userId).catch(() => null);
                    if (member && foundingRole && !member.roles.cache.has(foundingRole.id)) {
                        await member.roles.add(foundingRole);
                        badgeCount++;
                    }
                } catch (_) {}
            }
        }

        return badgeCount;
    } catch (err) {
        console.error('❌ [BADGE SYNC]', err);
        return 0;
    }
}

module.exports = {
    syncLevelsForAllUsers,
    syncBadges,
    calculateLevel
};
