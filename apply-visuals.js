require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log('--- SYNC ROLES START ---');
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const roles = await guild.roles.fetch();

        for (const [key, roleDef] of Object.entries(config.roles)) {
            let role = roles.find(r => r.name === roleDef.name);

            if (role) {
                console.log(`🎨 Mise à jour du rôle : ${roleDef.name}`);
                await role.edit({
                    color: roleDef.color,
                    hoist: roleDef.hoisted
                });
            } else {
                console.log(`🆕 Création du rôle : ${roleDef.name}`);
                await guild.roles.create({
                    name: roleDef.name,
                    color: roleDef.color,
                    hoist: roleDef.hoisted,
                    reason: 'Mise à jour visuelle Farmer League'
                });
            }
        }

        console.log('✅ Synchronisation des rôles terminée.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la sync des rôles:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
