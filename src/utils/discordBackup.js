const fs = require('fs');
const path = require('path');
const https = require('https');

const BACKUP_CHANNEL_NAME = 'sauvegarde-données';

const { ChannelType, PermissionFlagsBits } = require('discord.js');

async function findBackupChannel(client) {
    // Chercher le canal dans le serveur principal (GUILD_ID)
    const guildId = process.env.GUILD_ID;
    if (!guildId) {
        console.error('❌ [BACKUP] GUILD_ID manquant dans .env');
        return null;
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error(`❌ [BACKUP] Serveur ${guildId} introuvable.`);
        return null;
    }

    let channel = guild.channels.cache.find(c => c.name === BACKUP_CHANNEL_NAME && c.isTextBased());

    if (!channel) {
        console.log(`⚠️ [BACKUP] Canal #${BACKUP_CHANNEL_NAME} introuvable. Création en cours...`);
        try {
            channel = await guild.channels.create({
                name: BACKUP_CHANNEL_NAME,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: client.user.id, // Bot
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ]
            });
            console.log(`✅ [BACKUP] Canal #${BACKUP_CHANNEL_NAME} créé avec succès.`);
        } catch (error) {
            console.error('❌ [BACKUP] Erreur lors de la création du canal:', error);
            return null;
        }
    }
    return channel;
}

// Télécharger le JSON depuis une URL
function downloadJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function loadFromDiscord(client) {
    try {
        const channel = await findBackupChannel(client);
        if (!channel) {
            console.log(`⚠️ [BACKUP] Canal #${BACKUP_CHANNEL_NAME} introuvable.`);
            return null;
        }

        console.log(`📥 [BACKUP] Recherche de sauvegarde dans #${channel.name}...`);

        // Récupérer les derniers messages
        const messages = await channel.messages.fetch({ limit: 10 });
        // Trouver le dernier message avec un fichier JSON
        const lastBackupMsg = messages.find(m => m.attachments.size > 0 && m.attachments.first().name.endsWith('.json'));

        if (!lastBackupMsg) {
            console.log(`ℹ️ [BACKUP] Aucune sauvegarde trouvée.`);
            return null;
        }

        const attachment = lastBackupMsg.attachments.first();
        console.log(`📥 [BACKUP] Téléchargement de ${attachment.name}...`);

        const data = await downloadJson(attachment.url);
        console.log(`✅ [BACKUP] Données restaurées avec succès (${data.users?.length || 0} utilisateurs).`);
        return data;

    } catch (error) {
        console.error('❌ [BACKUP] Erreur lors du chargement:', error);
        return null;
    }
}

async function saveToDiscord(client, data) {
    try {
        const channel = await findBackupChannel(client);
        if (!channel) return false;

        const buffer = Buffer.from(JSON.stringify(data, null, 2));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fileName = `db_backup_${timestamp}.json`;

        await channel.send({
            content: `💾 **Sauvegarde Automatique** - ${new Date().toLocaleString()}`,
            files: [{
                attachment: buffer,
                name: fileName
            }]
        });

        console.log(`✅ [BACKUP] Sauvegarde envoyée sur Discord (${fileName})`);
        return true;

    } catch (error) {
        console.error('❌ [BACKUP] Erreur lors de l\'envoi:', error);
        return false;
    }
}

module.exports = { loadFromDiscord, saveToDiscord };
