const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getUser, createUser } = require('../database/db');
const embeds = require('../utils/embeds');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Voir tes statistiques')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Voir les stats d\'un autre utilisateur (optionnel)')
                .setRequired(false)
        ),

    async execute(interaction) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[DEBUG] HELLO STATS COMMAND CALLED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`[STATS] Commande lancée par ${interaction.user.username} (ID: ${interaction.user.id})`);

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            console.log(`[STATS] Cible: ${targetUser.username} (ID: ${targetUser.id})`);

            let userData = await getUser(targetUser.id);
            console.log(`[STATS] Données DB: ${userData ? 'Trouvées' : 'Non trouvées'}`);

            if (!userData) {
                // VÉRIFICATION DE SÉCURITÉ : Si l'utilisateur a un rôle de la League mais pas de profil DB
                const projectRoles = ['🥉 Rookie', '🥈 Hustler', '🥇 Grinder', '💎 Elite'];

                // On récupère le membre de manière sécurisée (depuis le cache ou fetch si besoin)
                const member = interaction.guild.members.cache.get(targetUser.id);
                const hasRole = member ? member.roles.cache.some(r => projectRoles.includes(r.name)) : false;

                console.log(`[STATS] Check rôles pour auto-profil: hasRole=${hasRole}, isSelf=${targetUser.id === interaction.user.id}`);

                if (hasRole && targetUser.id === interaction.user.id) {
                    // Création automatique du profil
                    console.log(`🆕 Création automatique du profil pour ${targetUser.username} (Rôle présent)`);
                    userData = createUser(targetUser.id, targetUser.username);

                    // Détecter le niveau basé sur le rôle pour être raccord
                    if (member.roles.cache.some(r => r.name === '💎 Elite')) userData.level = 'elite';
                    else if (member.roles.cache.some(r => r.name === '🥇 Grinder')) userData.level = 'grinder';
                    else if (member.roles.cache.some(r => r.name === '🥈 Hustler')) userData.level = 'hustler';
                    else userData.level = 'rookie';
                } else {
                    if (targetUser.id === interaction.user.id) {
                        return interaction.reply({
                            embeds: [embeds.error('Pas encore membre', 'Tu ne fais pas encore partie de l\'équipe. Utilise `/apply` pour postuler!')],
                            ephemeral: true
                        });
                    } else {
                        return interaction.reply({
                            embeds: [embeds.error('Utilisateur introuvable', 'Cet utilisateur n\'est pas dans la base de données.')],
                            ephemeral: true
                        });
                    }
                }
            }

            console.log(`[STATS] Envoi de l'embed pour ${targetUser.username}`);
            try {
                const logoPath = path.join(__dirname, '../../assets/logo.png');
                console.log(`[STATS] Path logo: ${logoPath}`);
                const logo = new AttachmentBuilder(logoPath, { name: 'logo.png' });

                await interaction.reply({
                    embeds: [embeds.userStats(targetUser, userData)],
                    files: [logo]
                });
                console.log(`[STATS] Reply envoyé avec succès`);
            } catch (replyError) {
                console.error(`[STATS] ERREUR LORS DU REPLY:`, replyError);
                // Tentative sans attachment si l'attachment foire
                await interaction.reply({
                    embeds: [embeds.userStats(targetUser, userData).setAuthor({ name: 'Profil Farmer League' })],
                    ephemeral: true
                }).catch(e => console.error(`[STATS] Échec ultime du reply:`, e));
            }
        } catch (error) {
            console.error('[STATS] CRASH GLOBAL:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erreur interne lors de la génération des stats.', ephemeral: true }).catch(() => { });
            }
        }
    }
};
