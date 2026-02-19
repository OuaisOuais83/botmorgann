require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`🤖 Bot prêt : ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        console.error('❌ Serveur non trouvé');
        process.exit(1);
    }

    // 1. Trouver la catégorie "CROISSANCE COMMUNAUTÉ"
    const category = guild.channels.cache.find(ch =>
        ch.type === ChannelType.GuildCategory && ch.name.includes('CROISSANCE')
    );

    if (!category) {
        console.error('❌ Catégorie "CROISSANCE COMMUNAUTÉ" non trouvée');
        process.exit(1);
    }

    // 2. Vérifier si le canal existe déjà
    let affiliationChannel = guild.channels.cache.find(ch =>
        ch.name.includes('système-affiliation') || ch.name.includes('affiliation')
    );

    if (!affiliationChannel) {
        console.log('⏳ Création du canal 💰・système-affiliation...');
        affiliationChannel = await guild.channels.create({
            name: '💰・système-affiliation',
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                }
            ]
        });
        console.log(`✅ Canal créé : #${affiliationChannel.name}`);
    } else {
        console.log(`ℹ️  Canal déjà existant : #${affiliationChannel.name}`);
    }

    // 3. Poster le contenu
    console.log('⏳ Publication du contenu...');

    const content1 = `# 💰 Système de Rémunération par Affiliation

## Comment Ça Marche ?

### Client Actuel : 200€ pour 1000 Clics

Notre premier client rémunère à hauteur de **200€ par 1000 clics** sur son lien d'affiliation.

### Ton Lien Individuel

Chaque monteur reçoit un **lien d'affiliation personnel** pour :
- Tracker tes performances individuellement
- Voir tes stats en temps réel
- Calculer ta rémunération exacte

### 📊 Tracking & Stats

Toutes tes stats sont relevées automatiquement :
- Nombre de clics sur ton lien
- Taux de conversion
- Revenus générés
- Performance par compte

---

## 🎬 Déclarer Tes Comptes

### Pourquoi Déclarer ?

Tu dois **notifier tous les @ de tes comptes** qui utilisent ton lien d'affiliation pour :
- ✅ Attribution correcte des clics
- ✅ Prévenir la fraude
- ✅ Optimiser le tracking

### Comment Déclarer ?

Utilise la commande \`/declare-accounts\` avec :
1. La plateforme (TikTok, Instagram, YouTube)
2. Ton @ ou username
3. **Le lien direct de ton profil** (obligatoire)
4. Nombre approximatif d'abonnés (optionnel)`;

    const content2 = `## 💵 Paiement

### Seuil Minimum

**50€** de gains accumulés avant paiement
(équivaut à ~250 clics sur ton lien)

### Fréquence

Paiements **mensuels** le 5 du mois suivant

### Méthode

- PayPal
- Virement bancaire
- Crypto (selon disponibilité)

---

## ❓ Questions Fréquentes

**Q : Combien je peux gagner ?**
R : Dépend de tes clics. 1000 clics = 200€. Pas de limite !

**Q : Comment avoir plus de clics ?**
R : Crée du contenu viral avec ton lien en bio/description

**Q : Puis-je avoir plusieurs comptes ?**
R : Oui ! Déclare-les tous pour le tracking avec \`/declare-accounts\`

**Q : Les clics sont-ils vérifiés ?**
R : Oui, le système détecte les clics frauduleux

---

**Prêt à générer des revenus ? Utilise \`/my-accounts\` pour voir tes comptes déclarés ! 💰**`;

    await affiliationChannel.send(content1);
    await affiliationChannel.send(content2);

    console.log('✅ Contenu publié avec succès !');
    console.log(`\n📢 Canal : #${affiliationChannel.name} (ID: ${affiliationChannel.id})`);

    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
