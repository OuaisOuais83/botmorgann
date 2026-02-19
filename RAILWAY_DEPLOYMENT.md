# 🚀 Déploiement Direct sur Railway (Sans GitHub)

## Guide Ultra-Rapide - 5 Minutes

Ce guide te permet de déployer ton bot **directement depuis ton ordinateur** vers Railway, sans passer par GitHub.

---

## Étape 1 : Installer Railway CLI

### Via NPM (recommandé)

```bash
npm install -g @railway/cli
```

### Vérifier l'installation

```bash
railway --version
```

Tu devrais voir quelque chose comme `railway version 3.x.x`

---

## Étape 2 : Se Connecter à Railway

```bash
railway login
```

Cela va ouvrir ton navigateur. Connecte-toi avec :
- **GitHub** (recommandé)
- **Google**
- **Email**

Une fois connecté, ferme le navigateur et retourne à ton terminal.

---

## Étape 3 : Créer un Nouveau Projet Railway

Navigue vers le dossier de ton bot :

```bash
cd C:\Users\Ganou\.gemini\antigravity\scratch\casino-discord-bot
```

Initialise le projet Railway :

```bash
railway init
```

**Questions qui vont apparaître :**

1. **"Enter project name:"** → Tape `farmer-league-bot`
2. **"Select a team:"** → Choisis ton compte (appuie sur Entrée)

Railway va créer le projet automatiquement.

---

## Étape 4 : Lier le Projet

```bash
railway link
```

Sélectionne le projet `farmer-league-bot` que tu viens de créer.

---

## Étape 5 : Configurer les Variables d'Environnement

**Option A : Via le terminal (recommandé)**

```bash
railway variables set DISCORD_TOKEN="TON_TOKEN_ICI"
railway variables set ADMIN_ID="TON_ID_DISCORD_ICI"
railway variables set NODE_ENV="production"
```

**⚠️ IMPORTANT :** Remplace `TON_TOKEN_ICI` et `TON_ID_DISCORD_ICI` par tes vraies valeurs !

**Option B : Via le dashboard Railway**

1. Tape `railway open` pour ouvrir le dashboard dans ton navigateur
2. Clique sur **Variables**
3. Ajoute manuellement les 3 variables

---

## Étape 6 : Déployer le Bot 🚀

```bash
railway up
```

Cette commande va :
1. Compresser ton code
2. L'envoyer à Railway
3. Installer les dépendances (`npm install`)
4. Démarrer le bot (`node src/index.js`)

**Attends 1-2 minutes...**

---

## Étape 7 : Vérifier que le Bot Fonctionne

### Voir les logs en temps réel

```bash
railway logs
```

Tu devrais voir :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌾 FARMER LEAGUE BOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bot connecté: FarmerLeagueBot#1234
📊 Serveurs: 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Initialisation de la base de données...
✅ Base de données initialisée avec succès!
📋 Enregistrement des commandes slash...
✅ Commandes slash enregistrées!

🚀 Bot totalement opérationnel!
```

### Vérifier sur Discord

- Ton bot doit avoir une **pastille verte** (en ligne)
- Tape `/apply` pour tester

---

## 🔧 Commandes Utiles

### Voir les logs

```bash
railway logs
```

### Redémarrer le bot

```bash
railway restart
```

### Ouvrir le dashboard Railway

```bash
railway open
```

### Mettre à jour le bot

Après avoir modifié ton code localement :

```bash
railway up
```

Railway va automatiquement redéployer la nouvelle version.

### Voir les variables d'environnement

```bash
railway variables
```

### Supprimer le projet (attention !)

```bash
railway down
```

---

## ✅ C'est Fait !

Ton bot est maintenant en ligne **24/7** sur Railway ! 🎉

**Prochaines étapes :**

1. ✅ Vérifie que le bot est en ligne sur Discord
2. ✅ Teste la commande `/apply`
3. ✅ Vérifie que tu reçois bien les notifications de candidature
4. ✅ Utilise `/setup` pour créer les canaux et rôles

---

## 🆘 Dépannage

### Le bot ne se connecte pas

**Vérifier les variables d'environnement :**

```bash
railway variables
```

S'il manque `DISCORD_TOKEN`, ajoute-le :

```bash
railway variables set DISCORD_TOKEN="TON_TOKEN_ICI"
```

### Erreur "Invalid token"

Ton token Discord a peut-être expiré :

1. Va sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Ton app → Bot → **Reset Token**
3. Copie le nouveau token
4. Mets à jour la variable :
   ```bash
   railway variables set DISCORD_TOKEN="NOUVEAU_TOKEN_ICI"
   railway restart
   ```

### Le bot se déconnecte après quelques minutes

Vérifie que le `Procfile` existe :

```bash
cat Procfile
```

Il doit contenir :
```
worker: node src/index.js
```

Si le fichier n'existe pas, crée-le et redéploie :

```bash
railway up
```

---

## 💰 Coûts

Railway offre **5$ de crédit gratuit par mois**.

Ton bot Discord consommera environ **2-3$ par mois**, ce qui est **totalement gratuit** !

Tu peux voir ta consommation avec :

```bash
railway open
```

Puis va dans **Project Settings → Usage**.

---

**🌾 Ton bot Farmer League tourne maintenant 24/7 ! 🚀**
