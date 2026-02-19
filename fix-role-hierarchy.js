
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    try {
        console.log('🚀 Correction de la hiérarchie des rôles...');

        const guilds = await client.guilds.fetch();
        const guild = await guilds.first().fetch();
        console.log(`Serveur: ${guild.name}`);

        const roles = await guild.roles.fetch();
        const foundingRole = roles.find(r => r.name === '🌾 Founding Member');
        const rookieRole = roles.find(r => r.name === '🥉 Rookie');

        if (!foundingRole || !rookieRole) {
            console.error('❌ Un des rôles est introuvable.');
            process.exit(1);
        }

        console.log(`Founding details: Pos=${foundingRole.position}, Color=${foundingRole.hexColor}, Hoist=${foundingRole.hoist}`);
        console.log(`Rookie details: Pos=${rookieRole.position}, Color=${rookieRole.hexColor}, Hoist=${rookieRole.hoist}`);

        // 1. Mettre Founding Member au-dessus de Rookie
        if (foundingRole.position <= rookieRole.position) {
            console.log('🔄 Déplacement de Founding Member au-dessus de Rookie...');
            await guild.roles.setPositions([
                { role: foundingRole, position: rookieRole.position + 1 },
                { role: rookieRole, position: rookieRole.position }
            ]);
            console.log('✅ Hiérarchie mise à jour.');
        } else {
            console.log('✅ Founding Member est déjà au-dessus de Rookie.');
        }

        // 2. Mettre la couleur de Founding Member à Default (pour hériter de Rookie)
        if (foundingRole.color !== 0) { // 0 = Default
            console.log('🎨 Réinitialisation de la couleur de Founding Member (pour hériter de Rookie)...');
            await foundingRole.setColor(0); // 0 = Default/Transparent
            console.log('✅ Couleur mise à jour.');
        } else {
            console.log('✅ La couleur est déjà par défaut.');
        }

        // 3. S'assurer que le Hoist est activé
        if (!foundingRole.hoist) {
            await foundingRole.setHoist(true);
            console.log('✅ Hoist activé.');
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        console.log('👋 Terminé.');
        client.destroy();
    }
});

client.login(process.env.DISCORD_TOKEN);
