# 🔍 Audit du projet Bot Discord Farmer League

**Date :** 23 février 2025  
**Objectif :** Identifier les erreurs, problèmes de conception et points de vigilance pour un déploiement sur Vercel.

---

## ⚠️ ALERTE CRITIQUE : Vercel et les bots Discord

**Un bot Discord ne peut PAS fonctionner correctement sur Vercel.**

| Vercel | Bot Discord |
|--------|-------------|
| Serverless (fonctions qui s'allument/éteignent) | Connexion WebSocket persistante 24/7 |
| Timeout max ~300s par requête | Doit rester connecté en permanence |
| Pas de processus long-running | `node src/index.js` tourne en continu |

**Alternatives recommandées pour le bot :**
- **Railway** (déjà configuré dans le projet via `railway.json`)
- **Render**
- **Fly.io**
- VPS (DigitalOcean, Hetzner, etc.)

**Pour la base de données sur Vercel :**  
Vercel Postgres (Neon) peut être utilisé **depuis Railway** ou un autre hébergeur. Le bot déployé sur Railway peut se connecter à une base Vercel Postgres en utilisant la même `DATABASE_URL`. C’est faisable pour l’architecture.

---

## 🐛 Erreurs bloquantes (à corriger en priorité)

### 1. `db.getApplications()` n’existe pas
**Fichier :** `src/commands/apply.js` ligne 35

```javascript
const applications = db.getApplications();  // ❌ Méthode inexistante
```

**Correction :**
```javascript
const applications = await db.getAllApplications();  // ✅
```

**Impact :** Erreur au runtime quand un utilisateur déjà candidat utilise `/apply` → crash.

---

### 2. Appels async sans `await` dans `referralTracking.js`
**Fichier :** `src/utils/referralTracking.js`

| Ligne | Appel | Problème |
|-------|------|----------|
| 54 | `db.getAllUsers()` | Retourne une Promise, pas les données |
| 55 | `allUsers.find(...)` | `allUsers` est une Promise → crash |
| 61-67 | `db.createReferral(...)` | Référence créée sans attendre la fin |
| 106 | `db.getReferralByReferred(userId)` | Même problème |
| 112 | `db.updateReferralStatus(...)` | Mise à jour non garantie |
| 115 | `db.updateUserReferralStats(...)` | Idem |
| 145, 151-155 | Idem dans `onFirstMissionCompleted` | Même motif |

**Impact :** Le système de parrainage ne fonctionne pas correctement (données incohérentes ou perdues).

---

### 3. Typo dans `createReferral` (db.js ligne 478)
**Fichier :** `src/database/db.js`

```javascript
referred_username: referrerUsername,  // ❌ Copie le parrain au lieu du filleul
```

**Correction :**
```javascript
referred_username: referredUsername,  // ✅
```

**Impact :** Le nom du filleul est mal enregistré (remplacé par celui du parrain).

---

### 4. `list-applications.js` – appel async sans `await`
**Fichier :** `list-applications.js` (racine)

```javascript
const apps = db.getAllApplications();  // getAllApplications est async
```

**Correction :** Utiliser `await db.getAllApplications()` dans une fonction `async`.

---

## 🔒 Problèmes de sécurité

### 1. Vérification admin incorrecte (`admin-reset-db.js`)
```javascript
if (interaction.user.id !== process.env.CLIENT_ID && interaction.user.id !== interaction.guild.ownerId)
```

- `CLIENT_ID` = ID de l’application Discord (le bot), pas d’un admin.
- Aucun humain n’aura jamais `user.id === CLIENT_ID`.
- Résultat : seul `guild.ownerId` est pertinent. Les administrateurs du serveur (via permissions) peuvent utiliser la commande.

**Recommandation :** Comparer à `ADMIN_ID` ou à une liste d’IDs admin.

---

### 2. Backup DB dans un canal Discord
- Données sensibles (candidatures, montants, emails, etc.) en clair dans les messages.
- En cas de fuite de token ou accès non autorisé au canal → exposition des données.

**Recommandation :** Migrer vers PostgreSQL/Vercel Postgres et supprimer ce backup en clair.

---

### 3. `.gitignore` incomplet
**Fichier :** `.gitignore`

- `farmer_league_bot.json` n’est **pas** ignoré.
- Risque de commiter des données utilisateurs.

**Correction :** Ajouter `farmer_league_bot.json` dans `.gitignore`.

---

### 4. `.env.example` incomplet
Variables manquantes :
- `GUILD_ID` (pour les commandes slash guild-only)
- `CLIENT_ID` (pour le déploiement des commandes)
- `DATABASE_URL` (si passage à PostgreSQL)

---

## ⚙️ Problèmes de conception

### 1. Reset forcé de la DB au démarrage
**Fichier :** `src/database/db.js`, `initDatabase()`

À chaque démarrage :
1. Suppression de `farmer_league_bot.json`
2. Tentative de restauration depuis Discord
3. Si échec (canal absent, rate limit, etc.) → DB vide

**Risque :** Perte de toutes les données si le backup Discord échoue.

---

### 2. Double implémentation DB (JSON vs PostgreSQL)
- `src/database/db.js` : JSON + backup Discord (actuellement utilisé)
- `src/database/postgres.js` : PostgreSQL complet, non utilisé

Conséquences :
- Code mort
- Maintenance et confusion accrues
- PostgreSQL installé (`pg`) mais jamais utilisé en prod

---

### 3. Dépendances inutiles
- `sql.js` : aucun usage détecté, peut être retiré.
- `pg` : utilisé uniquement dans `postgres.js` (non branché au flux principal).

---

### 4. Nombreux scripts à la racine
Des dizaines de scripts (`fix-*.js`, `create-*.js`, `update-*.js`, etc.) à la racine compliquent la navigation. Recommandation : regrouper dans `scripts/` ou archiver.

---

## 📋 Plan d’action recommandé

### Phase 1 – Corrections urgentes
1. Corriger `apply.js` : `getApplications` → `getAllApplications` avec `await`
2. Corriger `referralTracking.js` : ajouter `await` à tous les appels DB
3. Corriger la typo `referred_username` dans `db.js`
4. Ajouter `farmer_league_bot.json` au `.gitignore`

### Phase 2 – Déploiement et base de données
1. Déployer le **bot** sur Railway (ou équivalent), pas sur Vercel
2. Créer une base Vercel Postgres pour les données
3. Migrer de JSON vers PostgreSQL (en s’appuyant sur `postgres.js`)
4. Supprimer le backup DB dans un canal Discord

### Phase 3 – Sécurité et nettoyage
1. Corriger la vérification admin dans `admin-reset-db.js`
2. Compléter `.env.example`
3. Supprimer ou documenter les scripts one-shot
4. Revoir la stratégie de reset DB au démarrage

---

## 📁 Structure du projet (résumé)

```
botmorgann/
├── src/
│   ├── index.js              # Point d'entrée
│   ├── config.js             # Configuration
│   ├── commands/             # ~20 commandes slash
│   ├── database/
│   │   ├── db.js             # DB JSON (utilisée)
│   │   ├── postgres.js       # PostgreSQL (inutilisée)
│   │   └── seed.js
│   └── utils/
├── farmer_league_bot.json    # DB locale (à ignorer)
├── railway.json              # Config Railway
└── ~50 scripts divers
```

---

*Audit réalisé le 23 février 2025.*
