require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('🔧 REFONTE DU SERVEUR DISCORD - DÉBUT\n');
    console.log('========================================\n');

    // ============================================
    // ÉTAPE 1 : SUPPRESSION DES CANAUX INUTILES
    // ============================================
    console.log('📌 ÉTAPE 1/3 : Suppression des canaux inutiles\n');

    const channelsToDelete = [
        '🏆・hall-of-fame',
        '⚔️・tournois',
        '📊・ton-tableau-de-bord',
        '✅・projets-en-validation',
        '💵・compteur-gains',
        '🏆・bonus-et-badges',
        '🎯・missions-premium',
        '📊・stats-communauté',
        '🎯・défis-hebdomadaires'  // Sera fusionné dans missions
    ];

    for (const channelName of channelsToDelete) {
        const channel = guild.channels.cache.find(ch => ch.name === channelName);
        if (channel) {
            console.log(`🗑️  Suppression : ${channelName}...`);
            await channel.delete('Refonte du serveur - canal inutile');
            console.log(`   ✅ Supprimé`);
        } else {
            console.log(`   ⚠️  ${channelName} introuvable (déjà supprimé ?)`);
        }
    }

    console.log('\n========================================\n');

    // ============================================
    // ÉTAPE 2 : RENOMMAGE DES CANAUX
    // ============================================
    console.log('📌 ÉTAPE 2/3 : Renommage des canaux\n');

    const renameMap = {
        '🌾・notre-vision': '📖・comment-ça-marche',
        '💰・système-affiliation': '💰・comment-être-payé',
        '👥・parrainage': '🤝・invite-des-monteurs',
        '📋・missions-practice': '🎯・missions',
        '💬・entraide-technique': '💬・questions',
        '📖・ressources-gratuites': '📦・ressources',
        '🎬・projets-disponibles': '🎬・projets-ouverts',
        '🚀・projets-publiés': '🏆・hall-of-clips',
        '📋・admin-général': '📋・admin',
        '💼・acquisition-clients': '💼・clients',
        '✅・validation-projets': '✅・validation'
    };

    for (const [oldName, newName] of Object.entries(renameMap)) {
        const channel = guild.channels.cache.find(ch => ch.name === oldName);
        if (channel) {
            console.log(`✏️  Renommage : "${oldName}" → "${newName}"...`);
            await channel.setName(newName);
            console.log(`   ✅ Renommé`);
        } else {
            console.log(`   ⚠️  "${oldName}" introuvable`);
        }
    }

    console.log('\n========================================\n');

    // ============================================
    // ÉTAPE 3 : RÉORGANISATION DES CATÉGORIES
    // ============================================
    console.log('📌 ÉTAPE 3/3 : Réorganisation des catégories\n');

    // Renommer les catégories pour plus de clarté
    const categoryRenames = {
        '📢 BIENVENUE': '📢 BIENVENUE',  // OK
        '🌱 CROISSANCE COMMUNAUTÉ': '🌱 COMMUNAUTÉ',
        '🔰 ZONE ENTRAÎNEMENT': '🎯 FARMING',
        '⚙️ PRODUCTION': '⚙️ PRODUCTION',  // Sera vidée
        '💰 RÉMUNÉRATION': '💰 RÉMUNÉRATION',  // OK mais vide maintenant
        '👑 ZONE ELITE': '👑 ELITE',
        '🛠️ MANAGEMENT': '🛠️ ADMIN'
    };

    for (const [oldCatName, newCatName] of Object.entries(categoryRenames)) {
        const category = guild.channels.cache.find(ch =>
            ch.type === ChannelType.GuildCategory && ch.name === oldCatName
        );
        if (category && oldCatName !== newCatName) {
            console.log(`📁 Renommage catégorie : "${oldCatName}" → "${newCatName}"...`);
            await category.setName(newCatName);
            console.log(`   ✅ Renommé`);
        }
    }

    // Déplacer les canaux restants dans les bonnes catégories
    const communityCategory = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name.includes('COMMUNAUTÉ')
    );

    const farmingCategory = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name.includes('FARMING')
    );

    if (communityCategory) {
        // Déplacer "comment-être-payé" et "invite-des-monteurs" dans COMMUNAUTÉ
        const paymentChannel = guild.channels.cache.find(ch => ch.name.includes('comment-être-payé'));
        const inviteChannel = guild.channels.cache.find(ch => ch.name.includes('invite-des-monteurs'));

        if (paymentChannel && paymentChannel.parentId !== communityCategory.id) {
            await paymentChannel.setParent(communityCategory.id);
            console.log(`   📌 Déplacé "comment-être-payé" vers COMMUNAUTÉ`);
        }

        if (inviteChannel && inviteChannel.parentId !== communityCategory.id) {
            await inviteChannel.setParent(communityCategory.id);
            console.log(`   📌 Déplacé "invite-des-monteurs" vers COMMUNAUTÉ`);
        }
    }

    if (farmingCategory) {
        // Déplacer missions, questions, ressources, hall-of-clips dans FARMING
        const channelsToMove = ['missions', 'questions', 'ressources', 'hall-of-clips'];

        for (const channelName of channelsToMove) {
            const channel = guild.channels.cache.find(ch => ch.name.includes(channelName));
            if (channel && channel.parentId !== farmingCategory.id) {
                await channel.setParent(farmingCategory.id);
                console.log(`   📌 Déplacé "${channel.name}" vers FARMING`);
            }
        }
    }

    console.log('\n========================================\n');

    console.log('✨ REFONTE TERMINÉE !\n');
    console.log('📊 Résumé :');
    console.log('   - Canaux supprimés : 9');
    console.log('   - Canaux renommés : 11');
    console.log('   - Catégories réorganisées : 4');
    console.log('\n💡 Rafraîchis Discord (Ctrl+R) pour voir les changements !');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
