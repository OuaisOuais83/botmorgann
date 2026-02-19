require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}\n`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    console.log('📝 AJOUT DU CONTENU OPTIMISÉ DANS LES CANAUX\n');
    console.log('=============================================\n');

    // ============================================
    // 1. CANAL ACCUEIL
    // ============================================
    const accueilChannel = guild.channels.cache.find(ch => ch.name.includes('accueil'));
    if (accueilChannel) {
        console.log('📌 Mise à jour : #accueil...');

        // Supprimer les anciens messages
        const messages = await accueilChannel.messages.fetch({ limit: 100 });
        await accueilChannel.bulkDelete(messages, true);

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x4CAF50)
            .setTitle('🌾 BIENVENUE CHEZ FARMER LEAGUE')
            .setDescription(
                '**Tu es monteur vidéo ?** Tu veux **gagner de l\'argent** avec tes skills ?\n\n' +
                '## 🚀 PREMIÈRE ÉTAPE\n' +
                'Tape `/apply` pour postuler (2 minutes max)\n\n' +
                '## 💰 CE QUE TU GAGNES\n' +
                '💸 **200€ par 1000 clics** sur tes vidéos\n' +
                '🎯 **Missions rémunérées** selon ton niveau\n' +
                '📚 **Formation gratuite** incluse\n\n' +
                '## 📋 CANAUX IMPORTANTS\n' +
                '📖 <#COMMENT_ICI> → Comprendre le système\n' +
                '💰 <#PAIEMENT_ICI> → Comment être payé\n' +
                '📦 <#RESSOURCES_ICI> → Tutos et outils\n\n' +
                '**Let\'s farm ! 🚀**'
            )
            .setFooter({ text: 'Une question ? Pose-la dans #questions' });

        await accueilChannel.send({ embeds: [welcomeEmbed] });
        console.log('   ✅ Contenu ajouté\n');
    }

    // ============================================
    // 2. CANAL COMMENT-ÇA-MARCHE
    // ============================================
    const commentChannel = guild.channels.cache.find(ch => ch.name.includes('comment-ça-marche'));
    if (commentChannel) {
        console.log('📌 Mise à jour : #comment-ça-marche...');

        const messages = await commentChannel.messages.fetch({ limit: 100 });
        await commentChannel.bulkDelete(messages, true);

        const howItWorksEmbed = new EmbedBuilder()
            .setColor(0x536DFE)
            .setTitle('📖 COMMENT ÇA MARCHE ?')
            .setDescription(
                '**Farmer League** = Une communauté de monteurs qui **gagnent de l\'argent**.\n\n' +
                '## 🎯 LE CONCEPT EN 5 ÉTAPES\n\n' +
                '**1️⃣ TU POSTULES**\n' +
                'Tape `/apply` → On valide ton profil sous 24h\n\n' +
                '**2️⃣ TU REÇOIS TON LIEN**\n' +
                'Un lien d\'affiliation **unique** pour tracker tes clics\n\n' +
                '**3️⃣ TU CRÉES DES VIDÉOS**\n' +
                'Monte des clips viraux avec ton lien en bio\n\n' +
                '**4️⃣ LES GENS CLIQUENT**\n' +
                'Chaque clic = argent pour toi (**200€/1000 clics**)\n\n' +
                '**5️⃣ TU ES PAYÉ**\n' +
                'Paiement mensuel dès **50€** accumulés\n\n' +
                '## 🏆 SYSTÈME DE NIVEAUX\n' +
                '🥉 **Rookie** → Débute, apprend le système\n' +
                '🥈 **Hustler** → Performance moyenne, missions basiques\n' +
                '🥇 **Grinder** → Bon performer, missions premium\n' +
                '💎 **Elite** → Top performer, accès VIP + missions exclusives\n\n' +
                '**Simple, non ? Let\'s farm ! 🌾**'
            )
            .setFooter({ text: 'Prêt à commencer ? Tape /apply !' });

        await commentChannel.send({ embeds: [howItWorksEmbed] });
        console.log('   ✅ Contenu ajouté\n');
    }

    // ============================================
    // 3. CANAL COMMENT-ÊTRE-PAYÉ
    // ============================================
    const paymentChannel = guild.channels.cache.find(ch => ch.name.includes('comment-être-payé'));
    if (paymentChannel) {
        console.log('📌 Mise à jour : #comment-être-payé...');

        const messages = await paymentChannel.messages.fetch({ limit: 100 });
        await paymentChannel.bulkDelete(messages, true);

        const paymentEmbed = new EmbedBuilder()
            .setColor(0xFFD740)
            .setTitle('💰 COMMENT ÊTRE PAYÉ ?')
            .setDescription(
                '## 💸 MODÈLE DE RÉMUNÉRATION\n\n' +
                '**Client actuel : 200€ pour 1000 clics**\n\n' +
                'Tu reçois un **lien d\'affiliation unique** :\n' +
                '✅ Trackage en temps réel\n' +
                '✅ Statistiques détaillées\n' +
                '✅ Calcul automatique de ta rémunération\n\n' +
                '## 🎬 DÉCLARER TES COMPTES\n\n' +
                '**IMPORTANT** : Tu DOIS déclarer tous tes comptes sociaux avec `/declare-accounts`\n\n' +
                'Pourquoi ?\n' +
                '• Attribution correcte des clics\n' +
                '• Prévention de la fraude\n' +
                '• Optimisation du tracking\n\n' +
                '**Commandes utiles :**\n' +
                '`/declare-accounts` → Ajouter un compte\n' +
                '`/my-accounts` → Voir tes comptes déclarés\n' +
                '`/remove-account` → Supprimer un compte\n' +
                '`/my-stats-affiliation` → Voir tes stats et gains\n\n' +
                '## 💵 PAIEMENTS\n\n' +
                '**Seuil minimum :** 50€ (~250 clics)\n' +
                '**Fréquence :** Mensuel (le 5 du mois)\n' +
                '**Méthodes :** PayPal, Virement, Crypto\n\n' +
                '## ❓ FAQ\n\n' +
                '**Q : Combien je peux gagner ?**\n' +
                'R : Dépend de tes clics. 1000 clics = 200€. Pas de limite !\n\n' +
                '**Q : Comment avoir plus de clics ?**\n' +
                'R : Crée du contenu viral avec ton lien en bio/description\n\n' +
                '**Q : Les clics sont vérifiés ?**\n' +
                'R : Oui, le système détecte les clics frauduleux\n\n' +
                '**Let\'s make money ! 💰**'
            )
            .setFooter({ text: 'Tape /my-stats-affiliation pour voir tes gains' });

        await paymentChannel.send({ embeds: [paymentEmbed] });
        console.log('   ✅ Contenu ajouté\n');
    }

    // ============================================
    // 4. CANAL QUESTIONS
    // ============================================
    const questionsChannel = guild.channels.cache.find(ch => ch.name.includes('questions'));
    if (questionsChannel) {
        console.log('📌 Mise à jour : #questions...');

        const messages = await questionsChannel.messages.fetch({ limit: 100 });
        await questionsChannel.bulkDelete(messages, true);

        const questionsEmbed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('💬 POSE TES QUESTIONS ICI')
            .setDescription(
                '**Besoin d\'aide ?** La communauté est là ! 🤝\n\n' +
                '## 📋 RÈGLES SIMPLES\n' +
                '1. Une question = un message\n' +
                '2. Sois précis et clair\n' +
                '3. Partage des screenshots si besoin\n\n' +
                '## 🎯 QUESTIONS FRÉQUENTES\n' +
                'Avant de poster, check si ta question est ici :\n\n' +
                '**Comment postuler ?** → Tape `/apply`\n' +
                '**Voir mes stats ?** → Tape `/stats`\n' +
                '**Déclarer mes comptes ?** → Tape `/declare-accounts`\n' +
                '**Voir les missions ?** → Tape `/missions`\n\n' +
                '**On t\'aide, n\'hésite pas ! 💡**'
            );

        await questionsChannel.send({ embeds: [questionsEmbed] });
        console.log('   ✅ Contenu ajouté\n');
    }

    console.log('=============================================\n');
    console.log('✨ CONTENU OPTIMISÉ AJOUTÉ AVEC SUCCÈS !\n');
    console.log('💡 Les canaux sont maintenant clairs et engageants !');

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
