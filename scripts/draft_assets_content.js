const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const CHANNEL_NAME = 'annonces'; // Canal Admin pour vérification (ou 'admin-chat')

client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Trouver le canal Admin
    let channel = client.channels.cache.find(c => (c.name === CHANNEL_NAME || c.name.includes('admin')) && c.isTextBased());

    if (!channel) {
        console.error(`❌ Impossible de trouver un canal Admin.`);
        process.exit(1);
    }

    console.log(`📢 Envoi du BROUILLON dans #${channel.name}...`);

    const assetsEmbed = new EmbedBuilder()
        .setColor('#FFD700') // Or (Casino/Wealth)
        .setTitle('🎁 PACK ROOKIE : Les Essentiels Mushway')
        .setDescription(`
**Bienvenue dans l'élite.** 
Pour percer sur TikTok/Reels avec le contenu Mushway (Casino/Lifestyle), il ne suffit pas de couper. Il faut **captiver**.

Voici ton **Starter Pack** pour démarrer fort :

---

### 1️⃣ LES BASES DU MONTAGE "MUSHWAY"
*   **Rythme (Pacing)** : Un cut ou un changement visuel toutes les **2-3 secondes**. Pas de temps mort.
*   **Sous-titres** : Gros, centrés, police "The Bold Font" ou "Komika Axis". Couleurs principales : Blanc, Jaune (#FFD700), Vert Néon.
*   **Format** : Toujours 9:16 (Vertical). Remplis l'écran, pas de bandes noires.

### 2️⃣ LES "HOOKS" (ACCROCHES) QUI MARCHENT
*Utilise ces phrases textuelles dans les 3 premières secondes :*
*   "La technique interdite que les casinos détestent 🤫"
*   "Comment transformer 50€ en un SMIC en 10 min 💸"
*   "Mushway a failli tout perdre sur ce coup... 😱"
*   "Le meilleur casino en ligne ? La réponse va te surprendre."

### 3️⃣ RESSOURCES & ASSETS (À TÉLÉCHARGER)
*   **Logos Officiels** : [Lien Drive vers Logo Farmer League / Mushway] (À insérer)
*   **Overlays "Big Win"** : Effets de pièces qui tombent, confettis dorés.
*   **Sound Design** :
    *   *Slot Spin* (bruit de machine à sous) pour les moments de tension.
    *   *Ching Ching* (bruit de caisse) pour les gains.
    *   *Whoosh* (bruit de vent) pour les transitions rapides.

---

**💡 LE CONSEIL DU JOUR :**
L'émotion > La technique.
On veut voir la **joie** quand ça gagne, et la **rage** quand ça perd. Zoom sur les visages !

*Réagissez avec 🔥 si vous avez tout récupéré !*
        `)
        .setFooter({ text: 'Validation requise avant publication', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    try {
        await channel.send({ content: '**[BROUILLON] Proposition de contenu pour `#pack-assets-gratuits`** :', embeds: [assetsEmbed] });
        console.log('✅ Brouillon envoyé avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi:', error);
    }

    setTimeout(() => process.exit(0), 1000);
});

client.login(process.env.DISCORD_TOKEN);
