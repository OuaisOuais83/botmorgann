const { EmbedBuilder } = require('discord.js');
const config = require('../config');

// Templates d'embeds réutilisables
const embeds = {
    // Success embed
    success: (title, description) => {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },

    // Error embed
    error: (title, description) => {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },

    // Info embed
    info: (title, description) => {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    },

    // Warning embed
    warning: (title, description) => {
        return new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },

    // Welcome embed
    welcome: () => {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🌾 Bienvenue dans la Farmer League')
            .setDescription(
                '**Bienvenue dans la première équipe de farmers vidéo pro, gérée comme une vraie structure.**\n\n' +
                '💎 **Comment ça marche ?**\n' +
                '1. Lis notre vision dans <#VISION_CHANNEL>\n' +
                '2. Participe aux défis dans <#CHALLENGES_CHANNEL>\n' +
                '3. Ton **ticket** est créé à ton arrivée — remplis ta candidature\n\n' +
                '🚀 **Ce qui t\'attend:**\n' +
                '✅ Système de progression clair (Rookie → Elite)\n' +
                '✅ Défis hebdomadaires pour développer tes skills\n' +
                '✅ Communauté d\'entraide entre farmers\n' +
                '✅ Priorité sur les missions payées quand elles arrivent\n' +
                '✅ Ressources gratuites (templates, musiques, tutoriels)\n\n' +
                '**Tu es un pionnier - Ton investissement aujourd\'hui = ta position demain. Let\'s grow! 🚀**'
            )
            .setFooter({ text: 'Farmer League - On grandit ensemble' })
            .setTimestamp();
    },

    // Stats embed
    userStats: (user, userData) => {
        const level = config.levels[userData.level];
        const nextLevel = getNextLevel(userData.level);

        const levelEmoji = getLevelEmoji(userData.level);
        const logoURL = 'attachment://logo.png';

        let description = `### ${levelEmoji} **Niveau : ${level.name}**\n\n` +
            `▫️ **Engagement :** \`${userData.points}\` pts\n` +
            `▫️ **Contenu :** \`${userData.clips_completed}\` clips\n` +
            `▫️ **Série :** \`${userData.current_streak}\` jours 🔥\n\n` +
            `💰 **Finance :**\n` +
            `▫️ Total : \`${userData.total_earnings || 0} €\`\n` +
            `▫️ Retiré : \`${userData.withdrawn_earnings || 0} €\`\n\n`;

        if (nextLevel) {
            description += `🎯 **Objectif :** \`${userData.points}/${nextLevel.min}\` pts pour devenir **${nextLevel.name}**`;
        } else {
            description += `🏆 **LÉGENDE DE LA LEAGUE**`;
        }

        return new EmbedBuilder()
            .setColor(getLevelColor(userData.level))
            .setAuthor({ name: `Profil Farmer League`, iconURL: logoURL })
            .setTitle(user.username)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(description)
            .setFooter({ text: `Membre depuis ${new Date(userData.joined_at).toLocaleDateString('fr-FR')}` })
            .setTimestamp();
    },

    // Leaderboard embed
    leaderboard: (topUsers, period = 'all-time') => {
        const medals = ['🥇', '🥈', '🥉'];
        const description = topUsers.map((user, index) => {
            const medal = medals[index] || `**${index + 1}.**`;
            const levelEmoji = getLevelEmoji(user.level);
            return `${medal} ${levelEmoji} **<@${user.user_id}>** - ${user.points} pts | ${user.clips_completed} clips`;
        }).join('\n');

        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🏆 TOP 10 - ${period.toUpperCase()}`)
            .setDescription(description || 'Aucun farmer pour le moment')
            .setFooter({ text: 'Continue à progresser pour grimper le classement!' })
            .setTimestamp();
    },

    // Audit logs embed
    auditLogs: (logs, title = '📋 Logs d\'audit admin') => {
        const desc = logs.slice(0, 15).map(log => {
            const date = new Date(log.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
            const action = log.action_type || '?';
            const admin = log.admin_name || log.admin_id || '?';
            const target = log.target_name ? `<@${log.target_id}>` : (log.target_id || '-');
            const details = (log.details || '').substring(0, 80);
            return `\`${date}\` **${action}** par ${admin}\n  → ${target} ${details ? `: ${details}` : ''}`;
        }).join('\n\n') || 'Aucun log récent.';
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(title)
            .setDescription(desc.length > 4000 ? desc.substring(0, 3997) + '...' : desc)
            .setFooter({ text: `Derniers ${logs.length} événements` })
            .setTimestamp();
    },

    // Application/Candidature embed
    application: (app) => {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`📋 Candidature #${app.id} - ${app.username}`)
            .addFields(
                { name: 'Expérience', value: (app.experience || 'Non fourni').substring(0, 1024), inline: false },
                { name: 'Portfolio', value: (app.portfolio || 'Non fourni').substring(0, 1024), inline: false },
                { name: 'Motivation', value: (app.motivation || 'Non fourni').substring(0, 1024), inline: false },
                { name: 'Statut', value: app.status || 'pending', inline: true }
            )
            .setFooter({ text: `Candidat: ${app.user_id}` })
            .setTimestamp(app.applied_at ? new Date(app.applied_at) : undefined);
    },

    // Mission embed
    mission: (mission) => {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🎬 ${mission.title}`)
            .setDescription(mission.description || 'Pas de description')
            .addFields(
                { name: '🌾 Récompense', value: `**${mission.payment} points**`, inline: true },
                { name: '⏰ Deadline', value: mission.deadline || 'Flexible', inline: true },
                { name: '📊 Type', value: mission.type === 'standard' ? '👔 Client' : (mission.type.charAt(0).toUpperCase() + mission.type.slice(1)), inline: true },
                { name: '📋 Status', value: getStatusEmoji(mission.status) + ' ' + mission.status, inline: true }
            )
            .setFooter({ text: `Projet #${mission.id} | Farmer League` })
            .setTimestamp();
    }
};

// Fonctions helper
function getNextLevel(currentLevel) {
    const levels = ['rookie', 'hustler', 'grinder', 'elite'];
    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex < levels.length - 1) {
        return config.levels[levels[currentIndex + 1]];
    }
    return null;
}

function getLevelColor(level) {
    const colors = {
        rookie: config.colors.rookie,
        hustler: config.colors.hustler,
        grinder: config.colors.grinder,
        elite: config.colors.elite
    };
    return colors[level] || config.colors.primary;
}

function getLevelEmoji(level) {
    const emojis = {
        rookie: '🥉',
        hustler: '🥈',
        grinder: '🥇',
        elite: '💎'
    };
    return emojis[level] || '📊';
}

function getStatusEmoji(status) {
    const emojis = {
        available: '🆓',
        assigned: '🔄',
        completed: '✅',
        pending: '⏳'
    };
    return emojis[status] || '📋';
}

function progressBar(percentage) {
    const filledCount = Math.floor(percentage / 10);
    const emptyCount = 10 - filledCount;
    // Utilisation de cercles/carrés de couleur pour un look plus "Gaming"
    const filled = '🟩'.repeat(filledCount);
    const empty = '⬛'.repeat(emptyCount);
    return filled + empty;
}

module.exports = embeds;
