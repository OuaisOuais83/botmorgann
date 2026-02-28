require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const database = require('./database');
const cron = require('node-cron');
const config = require('./config');

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const fs = require('fs');
const path = require('path');

// Collection pour stocker les commandes
client.commands = new Collection();

// Chargement DYNAMIQUE des commandes depuis le dossier src/commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`📂 Chargement de ${commandFiles.length} commandes...`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`   ✅ ${command.data.name}`);
    } else {
        console.log(`   ⚠️ [WARNING] La commande ${filePath} n'a pas de propriété "data" ou "execute".`);
    }
}

// Event: Bot prêt
client.once('ready', async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌾 FARMER LEAGUE BOT - DIAGNOSTIC MODE');
    console.log(`🔧 PID: ${process.pid}`);
    console.log(`📂 CWD: ${process.cwd()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Bot connecté: ${client.user.tag}`);

    // Set Unique Status to Identify this Instance
    // Set Professional Status
    client.user.setPresence({
        activities: [{ name: 'Farmer League | /help', type: 3 }], // Watching
        status: 'online',
    });
    console.log(`🆔 Bot ID: ${client.user.id}`);
    console.log(`📊 Serveurs (${client.guilds.cache.size}):`);
    client.guilds.cache.forEach(guild => {
        console.log(`   - ${guild.name} (ID: ${guild.id})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialiser la base de données (Postgres si DATABASE_URL, sinon JSON+Discord)
    await database.initDatabase(client);

    // Enregistrer les commandes slash
    await registerCommands();

    // Activer le tracking des invitations pour le parrainage
    const { setupInviteTracking } = require('./utils/referralTracking');
    await setupInviteTracking(client);

    // Définir le statut du bot
    try {
        const assetsDir = path.join(__dirname, '../assets');
        if (fs.existsSync(assetsDir)) {
            console.log(`📂 [ASSETS] Contenu: ${fs.readdirSync(assetsDir).join(', ')}`);
        } else {
            console.log(`⚠️ [ASSETS] Dossier manquant à: ${assetsDir}`);
        }
    } catch (e) {
        console.error(`❌ [ASSETS] Erreur scan:`, e);
    }

    client.user.setPresence({
        activities: [{ name: '🚀 Besoin d\'aide ? Taper /help | Farmer League', type: 3 }],
        status: 'online'
    });

    // Lancer les automatisations
    startAutomations();

    console.log('🚀 Bot totalement opérationnel!\n');
});

// Event: Nouveau membre rejoint le serveur
client.on('guildMemberAdd', async (member) => {
    try {
        // Message ultra simple et direct EN PRIVÉ (DM)
        const welcomeMessage = `👋 **Bienvenue sur Farmer League !**

🌾 **Gagne de l'argent** avec tes montages vidéo

**Pour commencer :** va dans le canal #accueil et clique sur le bouton **Postuler** pour ouvrir ta candidature.

C'est tout. Simple. On te répond sous 24h. 🚀`;

        // Envoyer en DM (message privé, PAS de pollution du canal)
        await member.send(welcomeMessage);

        console.log(`✅ Message de bienvenue envoyé à ${member.user.tag}`);
    } catch (error) {
        // Si le DM échoue (DMs fermés), on ne fait rien pour ne pas polluer le canal
        console.log(`⚠️  Impossible d'envoyer DM à ${member.user.tag} (DMs fermés)`);
    }
});

// Event: Interaction créée (commandes slash)
client.on('interactionCreate', async interaction => {
    // Commandes slash
    if (interaction.isChatInputCommand()) {
        console.log(`📨 Interaction reçue: ${interaction.commandName} par ${interaction.user.tag}`);
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`❌ Commande non trouvée: ${interaction.commandName}`);
            return;
        }

        try {
            console.log(`▶️ Exécution de ${interaction.commandName}...`);
            await command.execute(interaction, client);
            console.log(`✅ Exécution terminée: ${interaction.commandName}`);
        } catch (error) {
            console.error(`❌ Erreur lors de l'exécution de ${interaction.commandName}:`, error);

            const code = error.code ?? error.rawError?.code;
            if (code === 10062 || code === 40060) return;

            const errorMessage = {
                content: '❌ Une erreur s\'est produite! Réessaie dans quelques secondes.',
                ephemeral: true
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (e) {
                if (e.code !== 10062 && e.code !== 40060) console.error('Erreur réponse:', e);
            }
        }
    }

    // Boutons
    if (interaction.isButton()) {
        try {
            if (['open-application-ticket', 'applicationModalTicket'].includes(interaction.customId) ||
                interaction.customId.startsWith('ticket-accept-') || interaction.customId.startsWith('ticket-reject-')) {
                console.log(`[TICKET] Bouton reçu: ${interaction.customId} par ${interaction.user.tag}`);
            }
            const ticketHandlers = require('./utils/ticketHandlers');
            if (interaction.customId === 'open-application-ticket') {
                await ticketHandlers.handleOpenApplicationTicket(interaction);
            } else if (interaction.customId === 'applicationModalTicket') {
                await ticketHandlers.showApplicationModal(interaction);
            } else if (interaction.customId.startsWith('ticket-accept-')) {
                await ticketHandlers.handleTicketAccept(interaction);
            } else if (interaction.customId.startsWith('ticket-reject-')) {
                await ticketHandlers.handleTicketReject(interaction);
            }
        } catch (err) {
            console.error('[TICKET] Erreur bouton', interaction.customId, err);
            if (!interaction.replied && !interaction.deferred) {
                interaction.reply({ content: '❌ Erreur. Réessaie ou contacte un admin.', ephemeral: true }).catch(() => {});
            } else if (interaction.deferred) {
                interaction.editReply({ content: '❌ Erreur. Réessaie ou contacte un admin.' }).catch(() => {});
            }
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'applicationModalTicket') {
            console.log(`[TICKET] Modal submit: applicationModalTicket par ${interaction.user.tag}`);
            try {
                const ticketHandlers = require('./utils/ticketHandlers');
                await ticketHandlers.handleApplicationModalSubmit(interaction);
            } catch (err) {
                console.error('[TICKET] Erreur handleApplicationModalSubmit:', err);
                interaction.reply({ content: '❌ Erreur lors de l\'envoi du formulaire.', ephemeral: true }).catch(() => {});
            }
            return;
        }
        if (interaction.customId.startsWith('ticketRejectModal-')) {
            const { handleTicketRejectModalSubmit } = require('./utils/ticketHandlers');
            await handleTicketRejectModalSubmit(interaction);
            return;
        }
        // Handler pour le modal de test (test-apply)
        if (interaction.customId === 'test-application-modal') {
            const instagram = interaction.fields.getTextInputValue('instagram');
            const portfolio = interaction.fields.getTextInputValue('portfolio');
            const experience = interaction.fields.getTextInputValue('experience');

            await interaction.reply({
                content:
                    `✅ **TEST RÉUSSI !** Le formulaire /apply fonctionne correctement.\\n\\n` +
                    `**Données reçues :**\\n` +
                    `→ Instagram: ${instagram}\\n` +
                    `→ Portfolio: ${portfolio}\\n` +
                    `→ Expérience: ${experience ? experience.substring(0, 50) : 'N/A'}...\\n\\n` +
                    `*Aucune candidature n'a été créée (mode test)*`,
                ephemeral: true
            });
            console.log(`✅ [TEST-APPLY] Test réussi par ${interaction.user.tag}`);
            return;
        }
        // Géré dans les commandes individuelles
    }
});

// Enregistrer les commandes slash
async function registerCommands() {
    const commands = [];
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`📋 Enregistrement de ${commands.length} commandes sur le serveur...`);

        // IMPORTANT: Utiliser applicationGuildCommands pour un enregistrement INSTANTANÉ sur le serveur cible
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('✅ Commandes slash enregistrées sur le serveur!\n');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
}

// Automatisations
function startAutomations() {
    // Message de motivation quotidien à 8h (DÉSACTIVÉ)
    // cron.schedule('0 8 * * *', () => {
    //     sendDailyMotivation();
    // });

    // Mise à jour du leaderboard quotidien à 20h
    cron.schedule('0 20 * * *', () => {
        updateDailyLeaderboard();
    });

    // Leaderboard hebdomadaire chaque lundi à 9h
    cron.schedule('0 9 * * 1', () => {
        updateWeeklyLeaderboard();
    });

    // Sauvegarde de sécurité quotidienne à 4h (no-op si Postgres, backup Discord si JSON)
    cron.schedule('0 4 * * *', () => {
        const db = require('./database');
        db.backupDatabase();
    });

    // Synchronisation des niveaux et badges chaque jour à 6h
    cron.schedule('0 6 * * *', async () => {
        const { syncLevelsForAllUsers, syncBadges } = require('./utils/levelSync');
        await syncLevelsForAllUsers(client);
        await syncBadges(client);
    });

    console.log('⏰ Automatisations programmées:\n   - Leaderboard quotidien: 20h00\n   - Leaderboard hebdomadaire: lundi 9h00\n   - Sync niveaux/badges: 6h00\n   - Sauvegarde de sécurité: 4h00\n');
}

// Envoyer un message de motivation
async function sendDailyMotivation() {
    const message = config.motivationMessages[
        Math.floor(Math.random() * config.motivationMessages.length)
    ];

    client.guilds.cache.forEach(guild => {
        const channel = guild.channels.cache.find(ch =>
            (ch.name.includes('défis-hebdomadaires') || ch.name.includes('accueil')) && ch.isTextBased()
        );

        if (channel) {
            channel.send(`## ${message}\n\n*Nouveau jour, nouvelle opportunité de progresser. Let's grow ensemble! 💪*`);
        }
    });
}

// Mettre à jour le leaderboard quotidien (20h) - All-time
async function updateDailyLeaderboard() {
    try {
        const { getTopUsers } = require('./database');
        const topUsers = await getTopUsers(10);
        if (topUsers.length === 0) return;

        const embeds = require('./utils/embeds');
        const embed = embeds.leaderboard(topUsers, 'all-time');

        for (const guild of client.guilds.cache.values()) {
            const ch = guild.channels.cache.find(c =>
                (c.name.includes('défis-hebdomadaires') || c.name.includes('hall-of-fame') || c.name.includes('accueil')) && c.isTextBased()
            );
            if (ch) await ch.send({ embeds: [embed] }).catch(() => {});
        }
        console.log('📊 Leaderboard quotidien publié');
    } catch (err) {
        console.error('❌ updateDailyLeaderboard:', err);
    }
}

// Leaderboard hebdomadaire (lundi 9h)
async function updateWeeklyLeaderboard() {
    try {
        const { getTopUsersThisWeek } = require('./database');
        const topUsers = await getTopUsersThisWeek(10);
        if (topUsers.length === 0) return;

        const embeds = require('./utils/embeds');
        const embed = embeds.leaderboard(topUsers, 'cette semaine');

        for (const guild of client.guilds.cache.values()) {
            const ch = guild.channels.cache.find(c =>
                (c.name.includes('défis-hebdomadaires') || c.name.includes('hall-of-fame')) && c.isTextBased()
            );
            if (ch) {
                await ch.send({
                    content: '🏆 **TOP 10 DE LA SEMAINE** — Bravo aux farmers les plus actifs !',
                    embeds: [embed]
                }).catch(() => {});
            }
        }
        console.log('📊 Leaderboard hebdomadaire publié');
    } catch (err) {
        console.error('❌ updateWeeklyLeaderboard:', err);
    }
}

// Serveur HTTP pour healthcheck (Railway, Render, etc.)
const http = require('http');
const HEALTH_PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        const monitor = require('./utils/health');
        const status = monitor.getSystemStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uptime: status.uptime, ...status }));
    } else {
        res.writeHead(404);
        res.end();
    }
});
server.listen(HEALTH_PORT, () => {
    console.log(`🩺 Healthcheck HTTP: http://localhost:${HEALTH_PORT}/health`);
});

// Gestion des erreurs
// --- GESTION DES ERREURS GLOBALE (AUTONOMIE) ---
const monitor = require('./utils/health');

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    monitor.logError(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    monitor.logError(error, 'Uncaught Exception');
});

console.log('🛡️ Système de sécurité actif: Le bot redémarrera automatiquement en cas d\'erreur mineure.');

// Login
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERREUR: DISCORD_TOKEN manquant dans le fichier .env');
    console.error('   Lis le fichier README.md pour les instructions de setup\n');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
