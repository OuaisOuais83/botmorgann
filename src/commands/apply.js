const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { createApplication, getUser } = require('../database');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('📝 Postuler pour rejoindre Farmer League'),

    async execute(interaction) {
        // Vérifier le rate limit (sécurité)
        const rateLimit = security.checkCommandCooldown(interaction.user.id, 'apply');
        if (!rateLimit.allowed) {
            return interaction.reply({
                embeds: [embeds.warning(
                    'Trop rapide',
                    `Attends ${rateLimit.timeLeft}s avant de postuler à nouveau.\n\n` +
                    `Prends le temps de bien préparer ta candidature! 💪`
                )],
                ephemeral: true
            });
        }

        // VÉRIFICATION BULLETPROOF : Double check pour éviter les faux positifs
        const existingUser = await getUser(interaction.user.id);

        // Log pour debug (visible dans Railway logs)
        console.log(`[/apply] Vérification pour ${interaction.user.username} (${interaction.user.id})`);
        console.log(`[/apply] Résultat getUser:`, existingUser ? 'TROUVÉ' : 'NON TROUVÉ');

        if (existingUser) {
            // Double vérification : check aussi les candidatures directement
            const db = require('../database');
            const applications = await db.getAllApplications();
            const userApplication = applications.find(app => app.user_id === interaction.user.id);

            console.log(`[/apply] Application trouvée:`, userApplication ? 'OUI' : 'NON');
            console.log(`[/apply] Statut:`, userApplication?.status || 'N/A');

            // Vérifier le statut via les rôles Discord
            const isApproved = interaction.member.roles.cache.some(role =>
                ['Rookie', 'Hustler', 'Grinder', 'Elite'].some(rank => role.name.includes(rank))
            );

            console.log(`[/apply] Rôle approuvé sur Discord:`, isApproved ? 'OUI' : 'NON');

            if (isApproved) {
                // Utilisateur déjà validé et actif
                console.log(`[/apply] ✅ Bloqué (déjà membre actif) : ${interaction.user.username}`);
                return interaction.reply({
                    embeds: [embeds.success(
                        'Déjà membre! 🎉',
                        `Tu fais déjà partie de l'équipe Farmer League!\\n\\n` +
                        `**Ton statut :** ${existingUser.role || 'Rookie'}\\n` +
                        `**Points :** ${existingUser.points || 0} pts\\n\\n` +
                        `Utilise \`/stats\` pour voir ton profil complet! 📊`
                    )],
                    ephemeral: true
                });
            } else if (userApplication && userApplication.status === 'pending') {
                // Candidature en attente (vérification supplémentaire)
                console.log(`[/apply] ⚠️ Bloqué (candidature en attente) : ${interaction.user.username}`);
                return interaction.reply({
                    embeds: [embeds.warning(
                        'Candidature déjà envoyée',
                        `Tu as déjà postulé! 📋\\n\\n` +
                        `**Si tu veux modifier ta candidature ou demander un suivi :**\\n` +
                        `→ Contacte un <@&${interaction.guild.roles.cache.find(r => r.name.includes('Admin'))?.id || 'admin'}> en message privé\\n\\n` +
                        `Les admins examinent chaque candidature avec attention. Patience! ⏳`
                    )],
                    ephemeral: true
                });
            } else {
                // CAS ÉTRANGE : User existe mais pas de rôle ni candidature pending
                // ON LAISSE PASSER pour éviter de bloquer un vrai candidat !
                console.log(`[/apply] ⚠️ ANOMALIE DÉTECTÉE - Mais on laisse passer par sécurité : ${interaction.user.username}`);
                console.log(`[/apply] → User existe dans DB mais pas de rôle ni candidature pending`);
                // On continue vers le formulaire (ligne suivante)
            }
        } else {
            console.log(`[/apply] ✅ Nouveau candidat détecté : ${interaction.user.username}`);
        }

        // Créer le modal de candidature
        const modal = new ModalBuilder()
            .setCustomId('applicationModal')
            .setTitle('Candidature Farmer League');

        // Champs du formulaire
        const experienceInput = new TextInputBuilder()
            .setCustomId('experience')
            .setLabel('Ton expérience en montage vidéo')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: 2 ans de montage, spécialisé dans les clips courts...')
            .setRequired(true)
            .setMaxLength(500);

        const portfolioInput = new TextInputBuilder()
            .setCustomId('portfolio')
            .setLabel('Lien portfolio (YouTube, Drive, etc.)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://...')
            .setRequired(true)
            .setMaxLength(200);

        const motivationInput = new TextInputBuilder()
            .setCustomId('motivation')
            .setLabel('Pourquoi rejoindre l\'équipe?')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Parle-nous de ta motivation...')
            .setRequired(true)
            .setMaxLength(500);

        // Ajouter les champs au modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(experienceInput),
            new ActionRowBuilder().addComponents(portfolioInput),
            new ActionRowBuilder().addComponents(motivationInput)
        );

        // Afficher le modal
        await interaction.showModal(modal);

        // Attendre la soumission
        const submitted = await interaction.awaitModalSubmit({
            time: 300000, // 5 minutes
            filter: i => i.user.id === interaction.user.id
        }).catch(() => null);

        if (!submitted) return;

        // Récupérer les réponses
        const experience = submitted.fields.getTextInputValue('experience');
        const portfolio = submitted.fields.getTextInputValue('portfolio');
        const motivation = submitted.fields.getTextInputValue('motivation');

        // Enregistrer dans la DB
        try {
            const newApp = createApplication(
                interaction.user.id,
                interaction.user.username,
                experience,
                portfolio,
                motivation
            );

            await submitted.reply({
                embeds: [embeds.success(
                    'Candidature envoyée!',
                    `## ✅ Candidature reçue!\n\n` +
                    `Merci ${interaction.user.username}! Ta candidature a été envoyée aux admins.\n\n` +
                    `**Tu vas recevoir une réponse dans les 24-48h.**\n\n` +
                    `En attendant, explore le serveur et regarde les exemples de clips! 🎬`
                )],
                ephemeral: true
            });

            // Attribuer le rôle Candidat
            try {
                const candidatRole = interaction.guild.roles.cache.find(r => r.name === '📋 Candidat');
                if (candidatRole) {
                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    await member.roles.add(candidatRole);
                    console.log(`✅ Rôle Candidat attribué à ${interaction.user.username}`);
                }
            } catch (roleError) {
                console.log('⚠️ Impossible d\'attribuer le rôle Candidat:', roleError.message);
            }

            // Notifier via le système centralisé
            const notifications = require('../utils/notifications');
            await notifications.notifyApplication(interaction.guild, newApp, interaction.user);

        } catch (error) {
            console.error('Erreur lors de la création de la candidature:', error);
            await submitted.reply({
                embeds: [embeds.error('Erreur', 'Une erreur est survenue. Réessaie plus tard.')],
                ephemeral: true
            });
        }
    }
};
