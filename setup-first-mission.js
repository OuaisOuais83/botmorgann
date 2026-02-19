require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');
const config = require('./src/config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté pour le premier défi (version propre): ${client.user.tag}`);

    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            console.error('❌ Serveur introuvable !');
            process.exit(1);
        }

        // 1. RECHERCHE ET RENOMMAGE CATEGORIE (Seulement si nécessaire)
        let farmingCat = guild.channels.cache.find(ch =>
            (ch.name.includes('FARMING')) &&
            ch.type === ChannelType.GuildCategory
        );

        if (farmingCat && farmingCat.name !== config.channels.categories.training) {
            console.log(`🏗️ Renommage de la catégorie en "${config.channels.categories.training}"...`);
            await farmingCat.setName(config.channels.categories.training);
        }

        // 2. RECHERCHE ET RENOMMAGE CANAL MISSIONS
        let missionsChannel = guild.channels.cache.find(ch =>
            ch.name.includes('missions') && ch.parentId === farmingCat.id
        );

        if (missionsChannel && missionsChannel.name !== '🎯・missions-hebdo') {
            console.log(`🏗️ Renommage du canal en "🎯・missions-hebdo"...`);
            await missionsChannel.setName('🎯・missions-hebdo');
        }

        // 3. POSTER LE DÉFI (Contenu demandé : Tiers/Optionnel + Mushway + ID)
        const challengeTitle = 'Le Meilleur Hook Insta';
        const challengeDesc = 'Ton objectif est de trouver l\'accroche (le Hook) la plus virale pour une vidéo courte de notre client **Mushway**. Celui qui génère le plus de rétention ou d\'originalité gagne.';
        const points = 500;
        const missionId = 1;

        console.log('📤 Publication du défi mis à jour sur Discord...');
        const challengeEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`🔥 DÉFI #1 : ${challengeTitle.toUpperCase()}`)
            .setDescription(
                `🚀 **C'est parti pour le premier défi communautaire !**\n\n` +
                `**Objectif :** ${challengeDesc}\n\n` +
                `🆔 **ID de la mission :** \`${missionId}\` (à utiliser pour ta soumission)\n` +
                `💎 **Récompense :** \`${points} pts\` d'engagement Farmer League\n` +
                `⏰ **Date de début :** 10/02/2026 (Après le lancement)\n` +
                `⏳ **Deadline :** 15/02/2026\n\n` +
                `⚠️ **Rappel important :** Ces défis tiers sont des **bonus facultatifs** pour booster ton engagement et ton rang dans la League. Ils s'ajoutent à tes revenus d'affiliation classiques (via tes liens Tap.it) qui restent ta source de gains principale et prioritaire. Libre à toi de participer ou non ! 🔥\n\n` +
                `*Soumission via la commande :*\n` +
                `> \`/mission submit id: ${missionId} lien: [ton_lien_de_clip]\``
            )
            .addFields(
                { name: '💡 Conseil', value: 'Focus sur les 3 premières secondes. C\'est là que tout se joue pour Mushway.' }
            )
            .setImage('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1000')
            .setFooter({ text: 'Farmer League - On grandit ensemble' })
            .setTimestamp();

        if (missionsChannel) {
            await missionsChannel.send({
                content: '🚀 **MISE À JOUR : PREMIER DÉFI DISPONIBLE !**',
                embeds: [challengeEmbed]
            });
            console.log('✅ Message envoyé.');
        } else {
            console.error('❌ Canal missions introuvable.');
        }

        console.log('🚀 Opération terminée.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);
