# 💡 Idées & Fonctionnalités à Explorer — Farmer League Bot

> Ce fichier recense toutes les idées identifiées au fil du développement qui n'ont pas encore été implémentées. Elles sont classées par thème et par priorité estimée.

---

## 🟥 Priorité Haute

### ✅ Tests critiques
- [ ] **Test /apply par un vrai utilisateur** — Confirmer que `denatore` (ou un autre farmer) peut bien postuler sans erreur depuis l'environnement Railway déployé
- [ ] **Test de la détection automatique d'invitations** — Vérifier que `referralTracking.js` détecte correctement les nouveaux membres arrivés via un lien parrain

### 🗃️ Base de données
- [ ] **Vérification "Client" mission type** — S'assurer que le type de mission `Client` est bien reconnu et affiché dans `/mission list`
- [ ] **Canal Annonces Générales** — Créer un canal `#annonces-générales` dédié aux communications importantes de l'équipe

---

## 🟧 Priorité Moyenne

### 📱 UX Monteurs — Gestion des comptes sociaux
- [ ] **Modification d'un compte** — Permettre aux monteurs de corriger un lien ou pseudo déclaré (actuellement impossible de modifier, seulement supprimer/re-ajouter)
- [ ] **Validation du format d'URL** — Ajouter une vérification regex dans `/declare-accounts` pour s'assurer que les liens commencent par `https://`
- [ ] **Commande `/update-account`** — Variante de `/declare-accounts` permettant de remplacer un compte existant sans supprimer

### 👨‍💼 Administration
- [ ] **Commande `/history`** — Voir l'historique des paiements passés (pour admin ET monteur)
- [ ] **Preuve de paiement** — Lors d'un `/pay approve`, demander à l'admin d'uploader une capture d'écran ou un lien de transaction envoyé en DM au monteur
- [ ] **Détection des doublons Tap.it** — Empêcher l'assignation du même lien Tap.it à deux personnes différentes

---

## 🟨 Priorité Basse / Futur

### 🎮 Gamification & Engagement
- [ ] **Notification Leaderboard hebdomadaire** — Envoyer automatiquement chaque lundi matin un message annonçant le Top 3 de la semaine pour créer de l'émulation
- [ ] **Système de badges** — Récompenses visuelles spéciales pour des accomplissements :
  - "10 clips validés en une semaine"
  - "1 million de vues cumulées"
  - "Premier à rejoindre" (badge Founding Member)
- [ ] **Système de niveaux complet (Rookie → Elite)** — Implémentation automatique des upgrades de rôle basées sur les points accumulés
- [ ] **Système de missions rémunérées** — Missions avec paiement direct lié à la validation d'un clip

### 🛡️ Sécurité & Résilience
- [ ] **Logs admin enrichis** — S'assurer que toutes les modifications de points et de rôles sensibles sont enregistrées dans le système de logs
- [ ] **Validation des entrées utilisateurs** — Ajouter des gardes-fous dans les commandes (ex: montants négatifs, valeurs aberrantes dans `/pay request`)

### 🌐 Tracking & Affiliation
- [ ] **Suivi des clics unique (affiliaux)** — Mettre en place un système fiable de comptage des clics uniques sur les liens Tap.it (problème VPN / doublons détecté avec Dub.co)
- [ ] **Tableau de bord affiliation** — Vue centralisée pour l'admin des stats de chaque monteur : clics, conversions, revenus générés
- [ ] **Alternative à Dub.co** — Explorer ClickMeter ou une solution custom pour le tracking si Dub.co s'avère insuffisant en précision

---

## 💬 Idées Community / Contenu

- [ ] **Canal `#hall-of-fame`** — Mettre en place et animer le canal dédié aux meilleurs clips de la semaine, avec un vote de la communauté
- [ ] **Défis hebdomadaires automatisés** — Créer un système de mission spéciale chaque semaine via le bot (ex: "Meilleur hook Instagram" du lancement)
- [ ] **Message de bienvenue personnalisé** — Banner + message DM personnalisé à chaque nouveau membre approuvé (avec son nom et son rang)
- [ ] **Contenu canal `#ressources-gratuites`** — Alimenter régulièrement avec des tutoriels montage, hook templates, stratégies virales

---

## 🔧 Améliorations Techniques

- [ ] **Migration SQLite → PostgreSQL complète** — S'assurer que 100% des données sont bien migrées sans perte (vérification post-migration)
- [ ] **Script de vérification de santé (healthcheck)** — Endpoint HTTP ou commande admin `/health` pour vérifier que le bot, la DB et les canaux sont bien opérationnels
- [ ] **Gestion des erreurs Discord améliorée** — Wrapper les appels Discord API avec retry automatique sur rate limit / timeout
- [ ] **Tests automatisés** — Écrire des tests unitaires pour les fonctions clés de `db.js` et `notifications.js`
- [ ] **Documentation API interne** — Documenter toutes les fonctions de `db.js` (JSDoc) pour faciliter les contributions futures

---

*Dernière mise à jour : 19 février 2026*
