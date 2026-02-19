require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const channels = await guild.channels.fetch();

        const adminMgmtName = '🏢 ADMIN & MANAGEMENT';
        const targetCategory = channels.find(c =>
            c.name.includes('ADMIN') && c.name.includes('MANAGEMENT') && c.type === ChannelType.GuildCategory
        );

        if (!targetCategory) {
            console.error(`❌ Category not found`);
            process.exit(1);
        }

        const adminChannel = channels.find(c =>
            c.name.includes('admin') && c.parentId === targetCategory.id
        );

        if (adminChannel) {
            console.log(`📍 Moving ${adminChannel.name} to the bottom of ${targetCategory.name}...`);
            // Set position to a very high number to push it to the bottom
            await adminChannel.setPosition(999);
            console.log('✅ Success');
        } else {
            console.log('❌ Admin channel not found in that category.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
