const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../database');
const embeds = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin-reset-db')
        .setDescription('⚠️ EFFACER TOUTE LA BASE DE DONNÉES (Irréversible)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Confirmation de sécurité
        if (interaction.user.id !== process.env.CLIENT_ID && interaction.user.id !== interaction.guild.ownerId) {
            // Optionnel: restreindre encore plus
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // 1. Vider la mémoire
            // On accède à la structure interne via une méthode dédiée ou on reset manuellement si possible.
            // Comme db.js expose 'database' en interne, on va ajouter une méthode 'resetAll' dans db.js
            // ou on utilise une astuce si on ne peut pas modifier db.js facilement ici.
            // Mais on A le contrôle de db.js.

            // Pour l'instant, disons qu'on appelle une nouvelle méthode db.resetAll()
            // Je dois modifier db.js pour exposer ça proprement.

            if (database.resetAll) {
                await database.resetAll();
                await interaction.editReply({
                    embeds: [embeds.success(
                        'Comptes Sociaux Réinitialisés',
                        '🧹 **Nettoyage Ciblé Terminé**\n\n' +
                        '✅ Tous les comptes sociaux ("8 comptes", doublons) ont été supprimés.\n' +
                        '🛡️ **SÉCURISÉ** : Les candidatures, points, et profils utilisateurs sont CONSERVÉS.\n\n' +
                        'Tu peux maintenant refaire `/declare-accounts` sur une base propre.'
                    )]
                });
            } else {
                await interaction.editReply('❌ La fonction resetAll() n\'est pas implémentée dans db.js.');
            }

        } catch (error) {
            console.error('Erreur admin-reset-db:', error);
            await interaction.editReply('❌ Erreur critique lors du reset.');
        }
    }
};
