# 🔄 Commande /update - Guide d'utilisation

La commande `/update` permet de modifier le serveur Discord **de manière incrémentale** sans tout recréer.

## 📋 Sous-commandes disponibles

### 1. `/update channels`
**Ajouter les canaux manquants**
- Vérifie la config
- Créé uniquement les canaux qui n'existent pas
- Ne touche pas aux canaux existants

**Cas d'usage:**
- Tu as ajouté un nouveau canal dans `config.js`
- Tu as accidentellement supprimé un canal
- Tu veux restaurer les canaux manquants

### 2. `/update roles`
**Ajouter les rôles manquants**
- Vérifie les rôles dans `config.js`
- Créé uniquement les rôles manquants
- Ne modifie pas les rôles existants

**Cas d'usage:**
- Nouveau rôle ajouté dans la config
- Rôle supprimé par erreur

### 3. `/update messages`
**Remplir les canaux vides**
- Parcourt tous les canaux
- Ajoute du contenu uniquement aux canaux VIDES
- Ne touche pas aux canaux déjà remplis

**Cas d'usage:**
- Canaux créés mais vides
- Nouveaux canaux à remplir
- Messages supprimés accidentellement

### 4. `/update channel-add`
**Ajouter un canal spécifique**

**Paramètres:**
- `nom`: Nom du canal (ex: nouveau-defi)
- `categorie`: (Optionnel) Nom de la catégorie parente

**Exemple:**
```
/update channel-add nom:test-canal categorie:bienvenue
```

### 5. `/update channel-delete`
**Supprimer un canal spécifique**

**Paramètres:**
- `canal`: Sélectionne le canal à supprimer

**Exemple:**
```
/update channel-delete canal:#ancien-canal
```

### 6. `/update full-sync`
**Synchronisation complète**
- Ajoute TOUS les rôles manquants
- Ajoute TOUS les canaux manquants
- Remplit TOUS les canaux vides
- **Ne supprime RIEN**

**Cas d'usage:**
- Après grosses modifications dans `config.js`
- Serveur partiellement configuré
- Vérification complète

---

## 🆚 Différence /setup vs /update

| Aspect | `/setup` | `/update` |
|--------|----------|-----------|
| **Suppression** | ✅ Supprime TOUT | ❌ Ne supprime rien |
| **Création** | ✅ Recrée tout de zéro | ✅ Ajoute uniquement manquants |
| **Utilisation** | Première installation | Modifications incrémentales |
| **Risque** | ⚠️ Perte données temporaire | ✅ Sûr, préserve l'existant |
| **Temps** | 60+ secondes | 5-20 secondes |

---

## 📖 Exemples d'utilisation

### Scénario 1: Nouveau canal dans config
```javascript
// Tu ajoutes dans config.js
growth: [
    { name: '📊・roadmap-farmer-league', type: 'text' },
    { name: '🎯・défis-hebdomadaires', type: 'text' },
    { name: '👥・parrainage', type: 'text' },
    { name: '⚔️・tournois', type: 'text' },
    { name: '🎁・récompenses', type: 'text' }  // ← NOUVEAU
]
```

**Action:**
```
/update channels
```

**Résultat:**
- ✅ Canal `🎁・récompenses` créé
- ✅ Autres canaux intacts

### Scénario 2: Canal supprimé par erreur
**Action:**
```
/update channels
```

**Résultat:**
- ✅ Canal manquant recréé automatiquement

### Scénario 3: Ajout manuel rapide
**Action:**
```
/update channel-add nom:📢・annonces categorie:bienvenue
```

**Résultat:**
- ✅ Canal créé instantanément

### Scénario 4: Canal de test à supprimer
**Action:**
```
/update channel-delete canal:#test-inutile
```

**Résultat:**
- ✅ Canal supprimé proprement

### Scénario 5: Après modification majeure config
**Action:**
```
/update full-sync
```

**Résultat:**
- ✅ Tout synchronisé avec `config.js`
- ✅ Rien de perdu

---

## ⚡ Workflow Recommandé

### Installation initiale
```
1. /setup (première fois seulement)
```

### Modifications quotidiennes
```
1. Modifie config.js
2. /update full-sync
```

### Ajout rapide
```
/update channel-add nom:nouveau-canal
```

### Nettoyage
```
/update channel-delete canal:#vieux-canal
```

### Vérification
```
/update messages (remplit les canaux vides)
```

---

## 🛡️ Sécurité

- ✅ **Aucune donnée perdue** avec `/update`
- ✅ **Mode admin seulement**
- ✅ **Confirmations visuelles**
- ✅ **Logs dans console**

---

## 💡 Tips

1. **Teste d'abord** avec `/update channels` ou `/update roles` avant `/update full-sync`
2. **Backup important:** Même si `/update` ne supprime rien, garde une copie de `config.js`
3. **Full-sync régulier:** Lance `/update full-sync` hebdomadairement pour vérifier
4. **Messages:** Lance `/update messages` après avoir créé de nouveaux canaux

---

C'est maintenant beaucoup plus flexible et sûr ! 🌾
