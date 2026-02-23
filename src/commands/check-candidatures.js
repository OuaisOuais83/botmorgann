const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-candidatures')
        .setDescription('[ADMIN] Vérifier toutes les candidatures et leurs dates'),

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

            // Récupérer toutes les candidatures
            const applications = await db.getAllApplications();

            if (!applications || applications.length === 0) {
                await interaction.editReply({
                    content: '📋 **Aucune candidature trouvée dans la base de données.**\n\nSi vous attendiez des candidatures, cela confirme qu\'aucune n\'a été créée pendant le problème.',
                    ephemeral: true
                });
                return;
            }

            // Trier par date (plus récentes en premier)
            const sortedApps = applications.sort((a, b) => {
                const dateA = new Date(a.created_at || 0);
                const dateB = new Date(b.created_at || 0);
                return dateB - dateA;
            });

            // Créer l'embed avec la liste
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(`📋 Liste des Candidatures (${applications.length})`)
                .setDescription('Voici toutes les candidatures dans la base de données :')
                .setTimestamp();

            // Afficher les 25 dernières (limite Discord)
            const displayApps = sortedApps.slice(0, 25);

            for (const app of displayApps) {
                const date = app.created_at ? new Date(app.created_at).toLocaleString('fr-FR', {
                    timeZone: 'Europe/Paris',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Date inconnue';

                const status = app.status === 'pending' ? '⏳ En attente' :
                    app.status === 'approved' ? '✅ Approuvée' :
                        app.status === 'rejected' ? '❌ Rejetée' : '❓ Inconnu';

                embed.addFields({
                    name: `${app.username || 'Utilisateur inconnu'} (#${app.id})`,
                    value: `📅 ${date}\n${status}`,
                    inline: true
                });
            }

            if (applications.length > 25) {
                embed.setFooter({ text: `Affichage des 25 dernières sur ${applications.length} candidatures totales` });
            }

            await interaction.editReply({ embeds: [embed] });

            // Log pour analyse
            console.log(`📊 [CHECK-CANDIDATURES] Total: ${applications.length} candidatures`);
            console.log(`📊 [CHECK-CANDIDATURES] En attente: ${applications.filter(a => a.status === 'pending').length}`);
            console.log(`📊 [CHECK-CANDIDATURES] Approuvées: ${applications.filter(a => a.status === 'approved').length}`);

        } catch (error) {
            console.error('❌ [CHECK-CANDIDATURES] Erreur:', error);
            await interaction.editReply({
                content: `❌ **ERREUR**\n\n${error.message}`,
                ephemeral: true
            });
        }
    }
};
