# 🌾 Farmer League Bot - Guide d'Installation

Bot Discord automatique pour gérer une équipe de farmers vidéo professionnels avec gamification complète.

## 🚀 Installation Ultra-Rapide (4 étapes)

### Étape 1: Télécharger Node.js (2 minutes)

1. Va sur https://nodejs.org
2. Clique sur le bouton vert "Download" (version LTS recommandée)
3. Lance l'installeur téléchargé
4. Clique sur "Next" jusqu'à la fin → Installe tout par défaut
5. Redémarre ton ordinateur si demandé

### Étape 2: Créer le Bot Discord (2 minutes)

1. **Va sur:** https://discord.com/developers/applications
2. **Connecte-toi** avec ton compte Discord
3. **Clique sur** "New Application" (en haut à droite)
4. **Donne un nom** à ton bot (ex: "Farmer League Bot")
5. **Va dans** l'onglet "Bot" (menu de gauche)
6. **Clique sur** "Add Bot" → Confirme
7. **IMPORTANT:** Active ces 3 intents (tout en bas):
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
8. **Clique sur "Reset Token"** → Copie le TOKEN (garde-le secret!)

### Étape 3: Inviter le Bot sur ton Serveur (1 minute)

1. **Toujours sur le site Discord Developers**
2. **Va dans** "OAuth2" → "URL Generator"
3. **Coche** "bot" et "applications.commands"
4. **Scroll tout en bas** et coche "Administrator"
5. **Copie le lien généré** et ouvre-le dans ton navigateur
6. **Choisis ton serveur** Discord
7. **Clique sur "Autoriser"**

### Étape 4: Lancer le Bot (1 minute)

1. **Copie le fichier** `.env.example` et renomme-le en `.env`
2. **Ouvre** `.env` avec Notepad
3. **Remplace** `VOTRE_TOKEN_ICI` par le TOKEN copié à l'étape 2
4. **Remplace** `TON_ID_DISCORD_ICI` par ton ID Discord
   - Pour obtenir ton ID: Clique droit sur ton nom dans Discord → "Copier l'ID"
   - Si tu ne vois pas cette option, va dans Paramètres Discord → Avancés → Active "Mode développeur"
5. **Sauvegarde** le fichier `.env`
6. **Double-clique sur** `START.bat`
7. **Attends 10-20 secondes** → Le bot sera en ligne! ✅

## ✨ Configuration Automatique du Serveur

Une fois le bot en ligne, dans Discord:

```
/setup
```

**💥 BOOM!** En 10 secondes, le bot va créer automatiquement:
- ✅ 7 rôles avec couleurs (Rookie, Hustler, Grinder, Elite, etc.)
- ✅ 30+ canaux organisés par catégories
- ✅ Permissions configurées automatiquement
- ✅ Messages de bienvenue dans chaque canal

## 📝 Commandes Disponibles

### Pour les Farmers

| Commande | Description |
|----------|-------------|
| `/apply` | Postuler pour rejoindre l'équipe (formulaire automatique) |
| `/mission list` | Voir toutes les missions disponibles |
| `/mission claim [id]` | Prendre une mission |
| `/mission submit [id] [lien]` | Soumettre un clip terminé |
| `/stats` | Voir tes statistiques personnelles |
| `/stats @user` | Voir les stats d'un autre farmer |
| `/leaderboard` | Voir le classement des top 10 farmers |
| `/pay view` | Voir tes gains et demandes de paiement |
| `/pay request [montant] [méthode]` | Demander un retrait (min 50€) |

### Pour les Admins

| Commande | Description |
|----------|-------------|
| `/setup` | Configuration complète du serveur (à faire 1 fois) |
| `/review approve [id]` | Accepter une candidature |
| `/review reject [id]` | Refuser une candidature |
| `/mission create` | Créer une nouvelle mission de montage |
| `/validate [id] [note]` | Valider un clip avec une note (A+, A, B, C, F) |

## 🎮 Système de Niveaux

Le bot gère automatiquement la progression:

**🥉 Rookie** (0-500 pts)
- Paiement: 10€/clip
- Max 1 mission/jour

**🥈 Hustler** (501-2000 pts)
- Paiement: 15€/clip
- Max 3 missions/jour

**🥇 Grinder** (2001-5000 pts)
- Paiement: 20€/clip
- Max 5 missions/jour
- Commission sur vues: 0.5€/10K

**💎 Elite** (5001+ pts)
- Paiement: 30€/clip
- Missions illimitées
- Commission sur vues: 1€/10K
- Accès salon VIP

**Les rôles sont mis à jour automatiquement!**

## 🎯 Workflow Complet

### 1. Recrutement
```
Un farmer tape: /apply
→ Formulaire automatique apparaît
→ Candidature sauvegardée en base de données
→ Admin reçoit notification
→ Admin tape: /review approve 1
→ Farmer reçoit rôle Rookie automatiquement
```

### 2. Production
```
Admin tape: /mission create
→ Mission postée dans #clips-disponibles
→ Farmer tape: /mission claim 1
→ Mission assignée et verrouillée
→ Monteur monte le clip
→ Monteur tape: /mission submit 1 https://lien.com
→ Clip envoyé en validation
```

### 3. Validation
```
Admin tape: /validate 1 A+ Super clip!
→ Points calculés automatiquement
→ Monteur notifié
→ Si seuil de niveau atteint:
   → Rôle mis à jour automatiquement
   → Annonce de promotion postée
   → Nouveau tarif appliqué
```

### 4. Paiement
```
Monteur tape: /pay view
→ Voit ses gains totaux
→ Monteur tape: /pay request 100 paypal
→ Demande envoyée admin
→ Admin approuve
→ Paiement traité
```

## 🔧 Dépannage

### Le bot ne démarre pas?

**Erreur "DISCORD_TOKEN manquant":**
- Vérifie que tu as bien renommé `.env.example` en `.env`
- Vérifie que ton TOKEN est bien collé dans `.env`
- Pas d'espaces avant/après le token

**Le bot ne se connecte pas:**
- Vérifie que le token est valide
- Va sur Discord Developers → Régénère un nouveau token si besoin
- Active les 3 "Gateway Intents" (étape 2)

### Les commandes n'apparaissent pas?

- Attends 5 minutes (Discord peut prendre du temps)
- Ferme `START.bat` et relance-le
- Vérifie que le bot a bien les permissions "Administrator"

### Le /setup ne crée rien?

- Vérifie que le bot a le rôle "Administrator" dans ton serveur
- Vérifie que le bot n'est pas en "offline"

### Erreur lors de l'installation (npm)?

- Redémarre ton ordinateur
- Vérifie que Node.js est bien installé: ouvre CMD et tape `node -v`
- Si ça ne marche pas, réinstalle Node.js

## 📂 Structure du Projet

```
casino-discord-bot/
├── START.bat              ← Double-clique pour lancer
├── STOP.bat               ← Double-clique pour arrêter
├── .env                   ← Tes secrets (TOKEN)
├── .env.example           ← Template à copier
├── package.json           ← Config Node.js
├── README.md              ← Ce fichier
├── casino_bot.db          ← Base de données (créée auto)
└── src/
    ├── index.js           ← Point d'entrée du bot
    ├── config.js          ← Configuration (couleurs, rôles, points)
    ├── database/
    │   └── db.js          ← Gestion base de données
    ├── commands/
    │   ├── setup.js       ← Commande /setup
    │   ├── apply.js       ← Commande /apply
    │   ├── review.js      ← Commande /review
    │   ├── mission.js     ← Commande /mission
    │   ├── validate.js    ← Commande /validate
    │   ├── leaderboard.js ← Commande /leaderboard
    │   ├── stats.js       ← Commande /stats
    │   └── pay.js         ← Commande /pay
    └── utils/
        └── embeds.js      ← Templates messages Discord
```

## 🎉 Félicitations!

Ton bot est maintenant opérationnel! 🚀

**Prochaines étapes:**
1. Tape `/setup` dans ton serveur pour créer toute la structure
2. Personnalise les messages de bienvenue
3. Crée tes premières missions
4. Recrute tes monteurs!

---

**Besoin d'aide?** Vérifie la section "Dépannage" ci-dessus.

**Le bot est 100% gratuit et open-source.** 💎
