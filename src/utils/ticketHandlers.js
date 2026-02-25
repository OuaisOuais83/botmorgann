const { ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');
const database = require('../database');
const embeds = require('./embeds');
const security = require('./security');
const { onApplicationApproved } = require('./referralTracking');

const configRoles = config.roles;

function slugChannelName(username) {
    return (username || 'user').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().substring(0, 20) || 'candidature';
}

async function handleOpenApplicationTicket(interaction) {
    const db = database;
    const rateLimit = security.checkCommandCooldown(interaction.user.id, 'apply');
    if (!rateLimit.allowed) {
        return interaction.reply({
            content: `⏳ Attends ${rateLimit.timeLeft}s avant de réessayer.`,
            ephemeral: true
        });
    }

    const existingUser = await db.getUser(interaction.user.id);
    const applications = await db.getAllApplications();
    const userApp = applications.find(a => a.user_id === interaction.user.id);

    const isApproved = interaction.member.roles.cache.some(r =>
        ['Rookie', 'Hustler', 'Grinder', 'Elite'].some(rank => r.name?.includes(rank))
    );

    if (isApproved) {
        return interaction.reply({
            content: '✅ Tu es déjà membre de la Farmer League !',
            ephemeral: true
        });
    }

    if (userApp && (userApp.status === 'pending' || userApp.status === 'ticket_open')) {
        return interaction.reply({
            content: '⚠️ Tu as déjà une candidature en cours. Vérifie tes canaux ou contacte un admin.',
            ephemeral: true
        });
    }

    const guild = interaction.guild;
    let category = guild.channels.cache.find(c => c.name === config.channels.categories.tickets && c.type === ChannelType.GuildCategory);
    if (!category) {
        category = await guild.channels.create({
            name: config.channels.categories.tickets,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] }
            ]
        });
    }

    const slug = slugChannelName(interaction.user.username) + '-' + interaction.user.id.slice(-4);
    const channelName = `candidature-${slug}`.substring(0, 100);

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
        ]
    });

    const adminRole = guild.roles.cache.find(r => r.name === configRoles.admin?.name);
    const modRole = guild.roles.cache.find(r => r.name === configRoles.moderator?.name);
    if (adminRole) await channel.permissionOverwrites.add(adminRole, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
    if (modRole) await channel.permissionOverwrites.add(modRole, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });

    const app = await db.createApplication(interaction.user.id, interaction.user.username, null, null, null, channel.id);

    const welcomeEmbed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle('🌾 Candidature Farmer League')
        .setDescription(
            `Bonjour ${interaction.user},\n\n` +
            `Tu as ouvert une candidature pour rejoindre la **Farmer League**.\n\n` +
            `Clique sur le bouton ci-dessous pour remplir ton dossier (expérience, portfolio, motivation).\n\n` +
            `*Tu recevras une réponse sous 24-48h.*`
        )
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('applicationModalTicket')
            .setLabel('Remplir ma candidature')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝')
    );

    await channel.send({
        content: `${interaction.user}`,
        embeds: [welcomeEmbed],
        components: [row]
    });

    const candidatRole = guild.roles.cache.find(r => r.name?.includes('Candidat'));
    if (candidatRole) {
        await interaction.member.roles.add(candidatRole).catch(() => {});
    }

    await interaction.reply({
        content: `✅ Ton canal de candidature a été créé : <#${channel.id}>`,
        ephemeral: true
    });
}

function showApplicationModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('applicationModalTicket')
        .setTitle('Candidature Farmer League');

    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('Ton expérience en montage vidéo')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Ex: 2 ans de montage, spécialisé dans les clips courts...')
                .setRequired(true)
                .setMaxLength(500)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('portfolio')
                .setLabel('Lien portfolio (YouTube, Drive, etc.)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('https://...')
                .setRequired(true)
                .setMaxLength(200)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('motivation')
                .setLabel('Pourquoi rejoindre l\'équipe?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Parle-nous de ta motivation...')
                .setRequired(true)
                .setMaxLength(500)
        )
    );

    return interaction.showModal(modal);
}

async function handleApplicationModalSubmit(interaction) {
    const experience = interaction.fields.getTextInputValue('experience');
    const portfolio = interaction.fields.getTextInputValue('portfolio');
    const motivation = interaction.fields.getTextInputValue('motivation');

    const app = await database.getApplicationByChannelId(interaction.channelId);
    if (!app || app.status !== 'ticket_open') {
        return interaction.reply({ content: '❌ Candidature introuvable ou déjà soumise.', ephemeral: true });
    }

    await database.updateApplication(app.id, { experience, portfolio, motivation, status: 'pending' });

    const embed = new EmbedBuilder()
        .setColor(config.colors.primary)
        .setTitle(`📋 Candidature de ${app.username}`)
        .addFields(
            { name: 'Expérience', value: experience.substring(0, 1024), inline: false },
            { name: 'Portfolio', value: portfolio.substring(0, 1024), inline: false },
            { name: 'Motivation', value: motivation.substring(0, 1024), inline: false }
        )
        .setFooter({ text: `ID: #${app.id}` })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ticket-accept-${app.id}`).setLabel('Accepter').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId(`ticket-reject-${app.id}`).setLabel('Refuser').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    await interaction.reply({
        content: '**Candidature envoyée !** Merci. Les admins vont examiner ton dossier.',
        ephemeral: false
    });

    await interaction.channel.send({
        content: '**Dossier candidature reçu**',
        embeds: [embed],
        components: [row]
    });

    const notifications = require('./notifications');
    const user = { id: app.user_id, username: app.username };
    await notifications.notifyApplication(interaction.guild, { ...app, experience, portfolio, motivation }, user);
}

async function handleTicketAccept(interaction) {
    if (!security.isAdmin(interaction.member)) {
        return interaction.reply({ content: '❌ Réservé aux admins.', ephemeral: true });
    }

    const appId = parseInt(interaction.customId.replace('ticket-accept-', ''));
    const db = database;
    const application = await db.getApplication(appId);

    if (!application || application.status !== 'pending') {
        return interaction.reply({ content: '❌ Candidature introuvable ou déjà traitée.', ephemeral: true });
    }

    await db.updateApplicationStatus(appId, 'approved', interaction.user.id);
    await db.createAuditLog('APPLICATION_APPROVED', interaction.user.id, interaction.user.username, application.user_id, application.username, `Candidature #${appId} approuvée`);

    let user = await db.getUser(application.user_id);
    if (!user) user = await db.createUser(application.user_id, application.username);

    try {
        const member = await interaction.guild.members.fetch(application.user_id);
        const roleRookie = interaction.guild.roles.cache.find(r => r.name === configRoles.rookie?.name || r.name?.includes('Rookie'));
        const roleCandidat = interaction.guild.roles.cache.find(r => r.name?.includes('Candidat'));
        if (roleRookie) await member.roles.add(roleRookie);
        if (roleCandidat) await member.roles.remove(roleCandidat);

        await member.send({
            embeds: [embeds.success(
                'Candidature Approuvée ! 🎉',
                `Bravo **${application.username}**, tu as rejoint la **Farmer League** !\n\n` +
                `Ton grade : **Rookie**\n` +
                `Va voir les missions pour commencer ! 🚀`
            )]
        }).catch(() => {});
    } catch (e) {
        console.error('Erreur rôles/DM:', e);
    }

    await onApplicationApproved(application.user_id, interaction.client);
    const notifications = require('./notifications');
    await notifications.notifyReview(interaction.guild, application, 'approved', interaction.user);

    await interaction.update({
        content: '✅ **Candidature acceptée !**',
        embeds: [],
        components: []
    });

    await interaction.channel.send({
        content: `**Bienvenue dans la Farmer League !**\nTa candidature a été acceptée. Tu recevras un DM avec les prochaines étapes.`
    });
}

async function handleTicketReject(interaction) {
    if (!security.isAdmin(interaction.member)) {
        return interaction.reply({ content: '❌ Réservé aux admins.', ephemeral: true });
    }

    const appId = parseInt(interaction.customId.replace('ticket-reject-', ''));
    const modal = new ModalBuilder()
        .setCustomId(`ticketRejectModal-${appId}`)
        .setTitle('Raison du refus');

    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Raison du refus (envoyée au candidat)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Ex: Portfolio ne correspond pas aux critères...')
                .setRequired(true)
                .setMaxLength(500)
        )
    );

    await interaction.showModal(modal);
}

async function handleTicketRejectModalSubmit(interaction) {
    const reason = interaction.fields.getTextInputValue('reason');
    const appId = parseInt(interaction.customId.replace('ticketRejectModal-', '')) || 0;

    const db = database;
    const application = await db.getApplication(appId);

    if (!application || application.status !== 'pending') {
        return interaction.reply({ content: '❌ Candidature introuvable ou déjà traitée.', ephemeral: true });
    }

    await db.updateApplicationStatus(application.id, 'rejected', interaction.user.id);
    await db.createAuditLog('APPLICATION_REJECTED', interaction.user.id, interaction.user.username, application.user_id, application.username, `Raison: ${reason}`);

    try {
        const member = await interaction.guild.members.fetch(application.user_id);
        await member.send({
            embeds: [embeds.error(
                'Candidature Refusée',
                `Désolé **${application.username}**, ta candidature n'a pas été retenue.\n\n**Raison :** ${reason}`
            )]
        }).catch(() => {});
    } catch (e) {}

    const notifications = require('./notifications');
    await notifications.notifyReview(interaction.guild, application, 'rejected', interaction.user);

    await interaction.reply({
        content: '❌ **Candidature refusée.** Le candidat a été notifié par DM.',
        ephemeral: true
    });

    const messages = await interaction.channel.messages.fetch({ limit: 15 });
    const msgWithButtons = messages.find(m => m.embeds[0]?.footer?.text === `ID: #${appId}`);
    if (msgWithButtons) {
        await msgWithButtons.edit({ components: [] }).catch(() => {});
    }

    await interaction.channel.send({
        content: `**Candidature refusée.**\nRaison communiquée au candidat par DM.`
    });
}

module.exports = {
    handleOpenApplicationTicket,
    showApplicationModal,
    handleApplicationModalSubmit,
    handleTicketAccept,
    handleTicketReject,
    handleTicketRejectModalSubmit
};
