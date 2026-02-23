// Système de tracking automatique des parrainages via invitations Discord

const { Events } = require('discord.js');
const db = require('../database/db');

// Fonction pour tracker les invitations (à ajouter dans index.js)
async function setupInviteTracking(client) {
    // Cache des invitations actuelles
    const invites = new Map();

    // Charger toutes les invitations au démarrage (client est déjà ready)
    const guild = client.guilds.cache.first();
    if (!guild) {
        console.log('⚠️ Aucun serveur trouvé pour le tracking des invitations');
        return;
    }

    try {
        const currentInvites = await guild.invites.fetch();
        currentInvites.forEach(invite => {
            invites.set(invite.code, invite.uses);
        });
        console.log('📊 Tracking des invitations activé');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des invitations:', error);
        return;
    }

    // Détecter quelle invitation a été utilisée
    client.on(Events.GuildMemberAdd, async (member) => {
        console.log(`👤 Nouveau membre détecté : ${member.user.tag} (${member.id})`);
        try {
            const guild = member.guild;

            // Récupérer les nouvelles invitations
            const newInvites = await guild.invites.fetch();
            console.log(`📋 Invitations récupérées : ${newInvites.size}`);

            // Trouver quelle invitation a été utilisée
            const usedInvite = newInvites.find(invite => {
                const oldUses = invites.get(invite.code) || 0;
                console.log(`   - Invite ${invite.code}: ${oldUses} -> ${invite.uses}`);
                return invite.uses > oldUses;
            });

            // Mettre à jour le cache
            newInvites.forEach(invite => {
                invites.set(invite.code, invite.uses);
            });

            if (usedInvite) {
                console.log(`🎯 Invitation utilisée détectée : ${usedInvite.code} par ${usedInvite.inviter?.tag}`);

                // Trouver le parrain (celui qui a créé l'invitation)
                const allUsers = await db.getAllUsers();
                const referrer = allUsers.find(u => u.referral_link === usedInvite.code);

                if (referrer) {
                    console.log(`✅ Parrain identifié dans la DB : ${referrer.username} (${referrer.user_id})`);

                    // Créer l'entrée de parrainage via db.js pour maintenir la cohérence
                    const referral = await db.createReferral(
                        referrer.user_id,
                        referrer.username,
                        member.user.id,
                        member.user.username,
                        usedInvite.code
                    );

                    console.log(`📝 Parrainage enregistré : ${member.user.username} invité par ${referrer.username}`);

                    // Notifier le parrain en DM
                    try {
                        const referrerUser = await client.users.fetch(referrer.user_id);
                        await referrerUser.send(
                            `🎉 **Nouveau filleul !**\n\n` +
                            `${member.user.username} a rejoint via ton lien !\n\n` +
                            `Tu gagneras **+50 points** quand il sera validé. 🚀`
                        );
                        console.log('📨 DM envoyé au parrain.');
                    } catch (err) {
                        console.log('⚠️ DM parrain échoué (DMs fermés):', err.message);
                    }

                    // Notifier les admins (NEW)
                    const notifications = require('../utils/notifications');
                    await notifications.notifyReferral(member.guild, referrer, member.user);

                } else {
                    console.log(`⚠️ Aucun utilisateur en base ne possède le code ${usedInvite.code}`);
                }
            } else {
                console.log('❓ Aucune incrémentation d\'invitation détectée (ou cache pas à jour).');
                // Fallback: Check if we can find by inviter ID if needed, but risky.
            }

        } catch (error) {
            console.error('❌ Erreur tracking parrainage:', error);
        }
    });
}

// Fonction à appeler quand une candidature est validée
async function onApplicationApproved(userId, client) {
    try {
        // Chercher si cet utilisateur a été parrainé
        const referral = await db.getReferralByReferred(userId);

        if (referral && referral.status === 'pending') {
            // Mettre à jour le statut
            if (referral) {
                // Utiliser db.updateReferralStatus pour la cohérence
                await db.updateReferralStatus(referral.id, 'validated', 50);

                // Mettre à jour l'utilisateur parrain de façon atomique (FIX)
                await db.updateUserReferralStats(referral.referrer_id, 50, 0);

                const referrer = await db.getUser(referral.referrer_id);
                if (referrer) {
                    console.log(`💰 ${referrer.username} a gagné 50 points (filleul validé)`);

                    // Notifier le parrain
                    if (client) {
                        try {
                            const referrerUser = await client.users.fetch(referrer.user_id);
                            await referrerUser.send(
                                `💰 **+50 points de parrainage !**\n\n` +
                                `${referral.referred_username} a été validé !\n\n` +
                                `Total points de parrainage : ${(referrer.referral_points || 0) + 50} pts 🚀`
                            );
                        } catch (err) {
                            console.log('DM parrain échoué');
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erreur onApplicationApproved:', error);
    }
}

// Fonction à appeler quand un filleul complète sa première mission
async function onFirstMissionCompleted(userId, client) {
    try {
        const referral = await db.getReferralByReferred(userId);

        if (referral && referral.status === 'validated' && !referral.first_mission_at) {
            // Mettre à jour le statut
            if (referral) {
                // Utiliser db.updateReferralStatus
                await db.updateReferralStatus(referral.id, 'active', 100);

                // Mettre à jour l'utilisateur parrain de façon atomique (FIX)
                // +100 points, +1 referral count (actif)
                await db.updateUserReferralStats(referral.referrer_id, 100, 1);

                const referrer = await db.getUser(referral.referrer_id);
                if (referrer) {
                    console.log(`💰 ${referrer.username} a gagné 100 points (première mission filleul)`);

                    // Notifier le parrain
                    if (client) {
                        try {
                            const referrerUser = await client.users.fetch(referrer.user_id);
                            await referrerUser.send(
                                `🎯 **+100 points de parrainage !**\n\n` +
                                `${referral.referred_username} a complété sa première mission !\n\n` +
                                `Total points de parrainage : ${(referrer.referral_points || 0) + 100} pts 🚀`
                            );
                        } catch (err) {
                            console.log('DM parrain échoué');
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erreur onFirstMissionCompleted:', error);
    }
}

module.exports = {
    setupInviteTracking,
    onApplicationApproved,
    onFirstMissionCompleted
};
