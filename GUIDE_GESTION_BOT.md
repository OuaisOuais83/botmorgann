# 🎮 Guide Rapide - Gérer le Bot

## ✅ Le Bot Est En Ligne

**Status actuel :** 🟢 ONLINE

---

## 📁 Fichiers Rapides (Double-clic)

J'ai créé 3 fichiers pour gérer facilement le bot :

### 1️⃣ `REDEMARRER_BOT.bat`
**Redémarre le bot** (à utiliser après modification du code)
- Double-clic sur le fichier
- Attend 3 secondes
- Affiche le nouveau statut

### 2️⃣ `VOIR_LOGS.bat`
**Voir les logs en temps réel** (ce qui se passe dans le bot)
- Double-clic sur le fichier
- Les logs s'affichent en direct
- Ctrl+C pour arrêter

### 3️⃣ `STATUT_BOT.bat`
**Voir si le bot est en ligne**
- Double-clic sur le fichier
- Affiche le statut complet

---

## ⚠️ Problème Commandes Discord

**Pourquoi `/review approved` ne s'affiche pas encore ?**

Discord peut prendre **jusqu'à 1 heure** pour mettre à jour les nouvelles commandes slash.

**Solutions :**

### Option 1 : Attendre (Recommandé)
- Attends 5-10 minutes
- Réessaye de taper `/review` sur Discord
- La nouvelle option `approved` devrait apparaître

### Option 2 : Forcer la Mise à Jour
1. Kick le bot de ton serveur Discord
2. Réinvite-le avec ce lien (remplace TON_CLIENT_ID) :
   ```
   https://discord.com/api/oauth2/authorize?client_id=TON_CLIENT_ID&permissions=8&scope=bot%20applications.commands
   ```
3. Les commandes seront instantanément mises à jour

### Option 3 : Vérifier manuellement
Tape `/` dans Discord et regarde si les commandes suivantes existent :
- `/review list` ✅
- `/review approved` ❓ (nouvelle)
- `/review approve` ✅
- `/review reject` ✅

---

## 📋 Récapitulatif des Commandes

### Commandes `/review` disponibles :

| Commande | Description |
|----------|-------------|
| `/review list` | Voir les candidatures **en attente** |
| `/review approved` | Voir les candidatures **approuvées** |
| `/review approved pseudo:Username` | Chercher une candidature approuvée par pseudo |
| `/review approve [id]` | Approuver une candidature |
| `/review reject [id]` | Rejeter une candidature |

---

## 🔧 Si Tu Veux Redémarrer Manuellement

### Via les fichiers .bat (FACILE)
Double-clic sur `REDEMARRER_BOT.bat` ✅

### Via PowerShell (Manuel)
```powershell
cd C:\Users\Ganou\.gemini\antigravity\scratch\casino-discord-bot
pm2 restart farmer-league-bot
```

---

## 🆘 Dépannage

### Le bot ne répond plus
1. Double-clic sur `STATUT_BOT.bat`
2. Si status = `stopped` → Double-clic sur `REDEMARRER_BOT.bat`

### Les commandes ne s'affichent pas
1. Attends 10 minutes
2. Redémarre Discord (l'application)
3. Si toujours rien → Kick et réinvite le bot

### Voir ce qui se passe
Double-clic sur `VOIR_LOGS.bat` → Ctrl+C pour arrêter

---

## ✅ Confirmation

**Le bot a été redémarré 3 fois :**
- Restart #1 : Notifications améliorées
- Restart #2 : Commande `/review list` améliorée  
- Restart #3 : **Commande `/review approved` ajoutée** ← Actuel

Les changements sont **actifs**, mais Discord doit mettre à jour la liste des commandes (5-60 minutes).

---

**🌾 Ton bot est 100% opérationnel ! Les commandes Discord vont se mettre à jour sous peu. 🚀**
