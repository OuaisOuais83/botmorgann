const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createApplication } = require('../database/db');
const notifications = require('../utils/notifications');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-candidature-complete')
        .setDescription('[ADMIN] Test complet : candidature + notification admin'),

    async execute(interaction) {
        try {
            // Vérifier si c'est un admin
            if (interaction.user.id !== process.env.ADMIN_ID && !interaction.member.roles.cache.some(role => role.name.includes('Admin'))) {
                await interaction.reply({
                    content: '❌ Cette commande est réservée aux administrateurs.',
                    ephemeral: true
                });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            // Créer une candidature de test
            const testUserId = 'TEST_' + Date.now();
            const testUsername = 'Test_Candidat_' + Math.floor(Math.random() * 1000);

            console.log('🧪 [TEST-CANDIDATURE] Création candidature test...');

            const newApp = createApplication(
                testUserId,
                testUsername,
                'Test d\'expérience : 3 ans de montage vidéo, spécialisé dans les clips gaming',
                'https://portfolio-test.example.com',
                'Test de motivation : Je veux rejoindre Farmer League pour progresser !'
            );

            console.log('🧪 [TEST-CANDIDATURE] Candidature créée:', newApp);

            // Tester la notification admin
            console.log('🧪 [TEST-CANDIDATURE] Envoi notification admin...');

            // Créer un utilisateur fictif pour le test
            const fakeUser = {
                id: testUserId,
                username: testUsername,
                discriminator: '0001',
                tag: testUsername + '#0001'
            };

            await notifications.notifyApplication(interaction.guild, newApp, fakeUser);

            console.log('✅ [TEST-CANDIDATURE] Notification envoyée avec succès');

            // Réponse détaillée
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ TEST RÉUSSI - Système de Candidature')
                .setDescription(
                    `**Le système fonctionne correctement !**\n\n` +
                    `**Candidature de test créée :**\n` +
                    `→ ID : ${testUserId}\n` +
                    `→ Nom : ${testUsername}\n` +
                    `→ Statut : ${newApp.status}\n\n` +
                    `**Notification admin :** ${newApp.notified ? '✅ Envoyée' : '⚠️ Non envoyée'}\n\n` +
                    `**Vérifiez le canal admin** pour voir la notification de candidature.\n\n` +
                    `*Cette candidature de test peut être supprimée manuellement si nécessaire.*`
                )
                .setTimestamp()
                .setFooter({ text: 'Test système de candidature' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ [TEST-CANDIDATURE] Erreur:', error);
            await interaction.editReply({
                content:
                    `❌ **ERREUR DÉTECTÉE DANS LE TEST**\n\n` +
                    `**Erreur :** ${error.message}\n\n` +
                    `Vérifiez les logs Railway pour plus de détails.`,
                ephemeral: true
            });
        }
    }
};
