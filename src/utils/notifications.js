const { EmbedBuilder } = require('discord.js');
const config = require('../config');

// CONFIGURATION DES CANAUX
// 1. Canal PUBLIC (Admins/Suivi)
const TRACKING_CHANNEL_ID = '1470227353132204095'; // 📱・tracking-comptes
// 2. Canal PRIVÉ (Backup/Sécurité)
const BACKUP_CHANNEL_ID = '1471135682767356063'; // 💾・sauvegarde-données

async function getChannel(guild, id, nameFallback) {
    let channel = guild.channels.cache.get(id);
    if (!channel && nameFallback) {
        channel = guild.channels.cache.find(c => c.name.includes(nameFallback) || c.name === nameFallback);
    }
    return channel;
}

const notifications = {
    // Fonction interne pour envoyer sur les deux canaux
    async sendDual(guild, embed, content = '', backupData = null) {
        try {
            // 1. Envoi Principal (Tracking)
            const trackingChannel = await getChannel(guild, TRACKING_CHANNEL_ID, 'tracking');
            if (trackingChannel) {
                await trackingChannel.send({ content, embeds: [embed] }).catch(e => console.error('❌ Echec envoi Tracking:', e));
            } else {
                console.warn('⚠️ Canal Tracking introuvable.');
            }

            // 2. Envoi Backup (Sécurité)
            const backupChannel = await getChannel(guild, BACKUP_CHANNEL_ID, 'sauvegarde');
            if (backupChannel) {
                // Créer un embed simplifié pour le backup + Data JSON
                const backupEmbed = new EmbedBuilder(embed.toJSON());
                backupEmbed.setFooter({ text: '🛡️ SAUVEGARDE DE SÉCURITÉ - NE PAS SUPPRIMER' });

                let backupMessage = `🔒 **BACKUP DONNÉES**\n`;
                if (backupData) {
                    // Ajouter les données brutes sous forme de bloc de code
                    backupMessage += `\`\`\`json\n${JSON.stringify(backupData, null, 2).substring(0, 1900)}\n\`\`\``;
                }

                await backupChannel.send({ content: backupMessage, embeds: [backupEmbed] }).catch(e => console.error('❌ Echec envoi Backup:', e));
            } else {
                console.warn('⚠️ Canal Backup introuvable.');
            }

        } catch (error) {
            console.error('❌ Erreur globale notifications:', error.message);
        }
    },

    async notifyApplication(guild, application, user) {
        const embed = new EmbedBuilder()
            .setColor('#FFA500') // Orange
            .setTitle('📝 Nouvelle Candidature')
            .setDescription(`**Candidat:** ${user} (\`${user.id}\`)`)
            .addFields(
                { name: 'Expérience', value: application.experience.substring(0, 1024) },
                { name: 'Portfolio', value: application.portfolio.substring(0, 1024) },
                { name: 'Action Requise', value: 'Utilisez `/review list` ou `/review approve ' + application.id + '`' }
            )
            .setTimestamp();

        // Backup Data: L'objet complet de la candidature
        const backupData = {
            type: 'APPLICATION',
            user_id: user.id,
            username: user.username,
            ...application
        };

        await this.sendDual(guild, embed, '🚨 **Nouvelle demande en attente !**', backupData);
    },

    async notifyReview(guild, application, action, admin) {
        const color = action === 'approved' ? '#00FF00' : '#FF0000';
        const title = action === 'approved' ? '✅ Candidature Approuvée' : '❌ Candidature Rejetée';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(`**Candidat:** <@${application.user_id}> (\`${application.user_id}\`)`)
            .addFields(
                { name: 'Gérée par', value: `${admin} (\`${admin.id}\`)`, inline: true },
                { name: 'ID Dossier', value: `#${application.id}`, inline: true }
            )
            .setTimestamp();

        const backupData = {
            type: 'REVIEW',
            action: action,
            admin_id: admin.id,
            application_id: application.id
        };

        await this.sendDual(guild, embed, '', backupData);
    },

    async notifyAccountDeclaration(guild, user, account, totalAccounts) {
        const embed = new EmbedBuilder()
            .setColor('#3498db') // Bleu
            .setTitle('📱 Compte Social Déclaré')
            .setDescription(`**Utilisateur:** ${user} (\`${user.id}\`)`)
            .addFields(
                { name: 'Plateforme', value: account.platform, inline: true },
                { name: 'Handle', value: account.handle, inline: true },
                { name: 'Followers', value: account.followers.toString(), inline: true },
                { name: 'Lien', value: account.profileLink },
                { name: 'Total Comptes', value: totalAccounts.toString() }
            )
            .setTimestamp();

        const backupData = {
            type: 'ACCOUNT_DECLARATION',
            user_id: user.id,
            account_data: account
        };

        await this.sendDual(guild, embed, '', backupData);
    },

    async notifyReferral(guild, referrer, newMember) {
        // ... (existing code)
        // ...
        await this.sendDual(guild, embed, '', backupData);
    },

    async notifyAccountEdit(guild, user, oldAccount, newAccount) {
        const embed = new EmbedBuilder()
            .setColor('#f1c40f') // Jaune
            .setTitle('✏️ Compte Social Modifié')
            .setDescription(`**Utilisateur:** ${user} (\`${user.id}\`)`)
            .addFields(
                { name: 'Avant', value: `${oldAccount.platform} - ${oldAccount.handle}\n${oldAccount.profileLink}`, inline: true },
                { name: 'Après', value: `${newAccount.platform} - ${newAccount.handle}\n${newAccount.profileLink}`, inline: true },
                { name: 'Followers', value: `${oldAccount.followers} ➔ ${newAccount.followers}`, inline: true }
            )
            .setTimestamp();

        const backupData = {
            type: 'ACCOUNT_EDIT',
            user_id: user.id,
            old_data: oldAccount,
            new_data: newAccount
        };

        await this.sendDual(guild, embed, '⚠️ **Modification de compte déclarée**', backupData);
    }
};

module.exports = notifications;
