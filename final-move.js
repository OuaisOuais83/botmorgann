require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log('--- START FINAL MOVE ---');
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const channels = await guild.channels.fetch();

        const adminMgmtName = '🏢 ADMIN & MANAGEMENT';
        const targetCategory = channels.find(c =>
            c.name.includes('ADMIN') && c.name.includes('MANAGEMENT') && c.type === ChannelType.GuildCategory
        );

        if (!targetCategory) {
            console.error(`❌ Catégorie cible introuvable !`);
            process.exit(1);
        }

        // Find channel with "admin" in it and NO parent
        const orphanAdmin = channels.find(c =>
            c.name.includes('admin') &&
            c.parentId === null &&
            c.type !== ChannelType.GuildCategory
        );

        if (orphanAdmin) {
            console.log(`📦 Déplacement de "${orphanAdmin.name}" (ID: ${orphanAdmin.id})...`);
            await orphanAdmin.setParent(targetCategory.id, { lockPermissions: true });
            console.log(`✅ Déplacement réussi.`);
        } else {
            console.log('🔍 Aucun canal admin orphelin trouvé.');
            // List all potential candidates
            channels.forEach(c => {
                if (c.name.includes('admin')) {
                    console.log(`- CANDIDAT: ${c.name} | PARENT: ${c.parentId ? c.parent.name : 'NONE'}`);
                }
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ CRASH:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
