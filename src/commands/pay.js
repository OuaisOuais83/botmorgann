const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUser, createPaymentRequest, getUserPayments, approvePayment, createAuditLog } = require('../database/db');
const config = require('../config');
const embeds = require('../utils/embeds');
const security = require('../utils/security');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('💰 Gestion des paiements')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('💵 Voir tes gains')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('request')
                .setDescription('📤 Demander un retrait')
                .addNumberOption(option =>
                    option.setName('montant')
                        .setDescription(`Montant à retirer (min ${config.minWithdrawal}€)`)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('methode')
                        .setDescription('Méthode de paiement')
                        .setRequired(true)
                        .addChoices(
                            { name: 'PayPal', value: 'paypal' },
                            { name: 'Crypto (USDT/BTC)', value: 'crypto' },
                            { name: 'Virement bancaire', value: 'bank' }
                        )
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const userData = await getUser(interaction.user.id);

            if (!userData) {
                return interaction.reply({
                    embeds: [embeds.error('Erreur', 'Tu n\'es pas encore membre.')],
                    ephemeral: true
                });
            }

            const payments = getUserPayments(interaction.user.id);
            const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            const approved = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

            await interaction.reply({
                embeds: [embeds.info(
                    '💰 Tes gains (Affiliation Tap.it)',
                    `**Revenus estimés:** ${userData.total_earnings}€\n` +
                    `*Basé sur le modèle 200€ les 1000 clics.*\n\n` +
                    `**Paiements approuvés:** ${approved}€\n` +
                    `**En attente:** ${pending}€\n` +
                    `**Disponible au retrait:** ${userData.total_earnings - approved - pending}€\n\n` +
                    `Utilise \`/pay request\` pour demander un retrait (min ${config.minWithdrawal}€)`
                )],
                ephemeral: true
            });

        } else if (subcommand === 'request') {
            // Vérifier le rate limit (sécurité)
            const rateLimit = security.checkCommandCooldown(interaction.user.id, 'pay');
            if (!rateLimit.allowed) {
                return interaction.reply({
                    embeds: [embeds.warning('Trop rapide', `Attends ${rateLimit.timeLeft}s avant de faire une nouvelle demande.`)],
                    ephemeral: true
                });
            }

            const montant = interaction.options.getNumber('montant');
            const methode = interaction.options.getString('methode');

            const userData = await getUser(interaction.user.id);

            if (!userData) {
                return interaction.reply({
                    embeds: [embeds.error('Erreur', 'Tu n\'es pas encore membre.')],
                    ephemeral: true
                });
            }

            if (montant < config.minWithdrawal) {
                return interaction.reply({
                    embeds: [embeds.error('Montant trop faible', `Le retrait minimum est de ${config.minWithdrawal}€`)],
                    ephemeral: true
                });
            }

            const payments = getUserPayments(interaction.user.id);
            const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
            const approved = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
            const available = userData.total_earnings - approved - pending;

            if (montant > available) {
                return interaction.reply({
                    embeds: [embeds.error('Fonds insuffisants', `Tu as ${available}€ disponibles.`)],
                    ephemeral: true
                });
            }

            createPaymentRequest(interaction.user.id, montant, methode);

            // Avertir si double vérification requise (sécurité)
            const needsDoubleCheck = security.requiresDoubleVerification(montant);
            const warningMsg = needsDoubleCheck ? '\n\n⚠️ Ce montant nécessite une double vérification admin.' : '';

            await interaction.reply({
                embeds: [embeds.success(
                    'Demande envoyée',
                    `✅ Demande de retrait de **${montant}€** envoyée!\n\n` +
                    `**Méthode:** ${methode}${warningMsg}\n\n` +
                    `Tu recevras une notification dès que le paiement sera traité (24-48h).`
                )]
            });

            // LOG D'AUDIT (sécurité)
            createAuditLog(
                'PAYMENT_REQUESTED',
                interaction.user.id,
                interaction.user.username,
                interaction.user.id,
                interaction.user.username,
                `Demande de retrait: ${montant}€ via ${methode}`
            );

            // Notifier les admins
            const adminChannel = interaction.guild.channels.cache.find(ch => ch.name.includes('admin-général'));
            if (adminChannel) {
                const doubleCheckWarning = needsDoubleCheck ?
                    '\n\n⚠️ **DOUBLE VÉRIFICATION REQUISE (Montant > 200€)**' : '';

                adminChannel.send({
                    content: '@here 💰 **Nouvelle demande de paiement**',
                    embeds: [embeds.info(
                        'Demande de retrait',
                        `**Utilisateur:** <@${interaction.user.id}>\n` +
                        `**Montant:** ${montant}€\n` +
                        `**Méthode:** ${methode}${doubleCheckWarning}`
                    )]
                });
            }
        }
    }
};
