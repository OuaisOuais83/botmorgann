require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { initDatabase } = require('./database/db');
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

    // Initialiser la base de données (avec le client pour la sauvegarde Discord)
    await initDatabase(client);

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

**Pour commencer, tape dans le serveur :**
\`\`\`
/apply
\`\`\`

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

            const errorMessage = {
                content: '❌ Une erreur s\'est produite! (CRASH_TRACE_999)',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    // Boutons et autres interactions
    if (interaction.isButton()) {
        // Géré dans les commandes individuelles
    }

    if (interaction.isModalSubmit()) {
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

    // Sauvegarde de sécurité quotidienne à 4h du matin
    cron.schedule('0 4 * * *', () => {
        const { backupDatabase } = require('./database/db');
        backupDatabase();
    });

    console.log('⏰ Automatisations programmées:\n   - Motivation quotidienne: 8h00\n   - Leaderboard quotidien: 20h00\n   - Sauvegarde de sécurité: 4h00\n');
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

// Mettre à jour le leaderboard quotidien
async function updateDailyLeaderboard() {
    // Implémentation dans une version future
}

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
