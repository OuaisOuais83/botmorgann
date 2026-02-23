# 🔑 Obtenir ton Railway API Token - ÉTAPE UNIQUE

## 🎯 Action Requise (1 minute)

Pour que je puisse **tout automatiser**, tu dois obtenir un token API Railway. C'est l'UNIQUE action que tu dois faire manuellement.

---

## Étapes pour Obtenir le Token

### 1. Ouvre ce lien dans ton navigateur

👉 **https://railway.app/account/tokens**

### 2. Connecte-toi à Railway

- Utilise **GitHub** (recommandé - plus stable que Google)
- Ou **Email** si tu préfères

### 3. Créer un Token

1. Clique sur **"Create Token"** ou **"New Token"**
2. Donne-lui un nom : `farmer-league-bot`
3. Sélectionne les permissions :
   - ✅ **Full Access** (ou toutes les permissions)
4. Clique sur **Create**

### 4. Copier le Token

⚠️ **IMPORTANT** : Le token ne s'affiche qu'**UNE SEULE FOIS** !

- Copie le token (il ressemble à : `railway_xxx...`)
- **GARDE-LE SECRET** (c'est comme un mot de passe)

### 5. Utiliser le Token (sans le partager)

⚠️ **Ne colle JAMAIS ton token dans un chat** — c'est un secret comme un mot de passe !

Pour déployer :
1. Ouvre un terminal dans le dossier du projet
2. Tape `$env:RAILWAY_TOKEN="ton_token_ici"` (PowerShell) pour la session
3. Puis `railway up --service botmorgann`

Ou utilise `railway login` qui ouvre le navigateur (aucun token à copier).

---

## ❓ Si le lien ne fonctionne pas

1. Va sur https://railway.app
2. Connecte-toi
3. Clique sur ton profil (coin supérieur droit)
4. Clique sur **Account Settings**
5. Va dans l'onglet **Tokens**
6. Crée un nouveau token

---

**Utilise `railway login` pour te connecter sans partager de token.**
