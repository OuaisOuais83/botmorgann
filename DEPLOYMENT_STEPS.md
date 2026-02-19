# 🚀 ÉTAPES RAPIDES - Déploiement Railway CLI

## ✅ Étapes Déjà Complétées

- [x] Railway CLI installé
- [x] PowerShell configuré

---

## 📋 Prochaines Étapes (À Faire MAINTENANT)

### Étape 1 : Se Connecter à Railway

Ouvre ton terminal PowerShell dans le dossier du bot et tape :

```powershell
cd C:\Users\Ganou\.gemini\antigravity\scratch\casino-discord-bot
railway login
```

**Ton navigateur va s'ouvrir** → Connecte-toi avec GitHub, Google ou Email

---

### Étape 2 : Créer le Projet

```powershell
railway init
```

**Questions :**
- **"Enter project name:"** → Tape `farmer-league-bot` et appuie sur Entrée
- Choisis ton compte (appuie sur Entrée)

---

### Étape 3 : Configurer les Variables

**⚠️ REMPLACE LES VALEURS CI-DESSOUS PAR TES VRAIES VALEURS !**

```powershell
railway variables set DISCORD_TOKEN="TON_TOKEN_DISCORD_ICI"
railway variables set ADMIN_ID="TON_ID_DISCORD_ICI"
railway variables set NODE_ENV="production"
```

**Où trouver ces valeurs ?**

- **DISCORD_TOKEN** : [Discord Developer Portal](https://discord.com/developers/applications) → Ton app → Bot → Reset Token
- **ADMIN_ID** : Discord → Clic droit sur ton nom → Copier l'ID utilisateur

---

### Étape 4 : Déployer 🚀

```powershell
railway up
```

Attends 1-2 minutes... Ton bot sera en ligne !

---

### Étape 5 : Vérifier les Logs

```powershell
railway logs
```

Tu devrais voir :
```
✅ Bot connecté: FarmerLeagueBot#1234
🚀 Bot totalement opérationnel!
```

---

## ✅ Une Fois en Ligne

1. Vérifie sur Discord → Le bot doit avoir une **pastille verte**
2. Tape `/apply` pour tester
3. Demande à quelqu'un de postuler pour tester les notifications

---

## 🔧 Commandes Utiles

```powershell
railway logs          # Voir les logs en temps réel
railway restart       # Redémarrer le bot
railway open          # Ouvrir le dashboard Railway
railway up            # Mettre à jour après modification du code
```

---

**🌾 Suis ces étapes et ton bot sera en ligne 24/7 ! 🚀**
