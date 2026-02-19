# 🧪 Guide de Test - Farmer League Bot

Ce guide te permet de vérifier que toutes les nouvelles fonctionnalités (Missions Hook & Affiliation) fonctionnent comme prévu.

## 1. Préparation du Serveur
> [!NOTE]
> La commande `/setup` est désormais **SÉCURISÉE** par défaut. Elle ne supprime rien et se contente de mettre à jour les canaux manquants.
1. Utilise `/setup` sans option pour mettre à jour les canaux existants. Tes données et candidatures sont en **sécurité** (base de données JSON jamais touchée).
2. Si tu veux vraiment repartir de zéro, utilise `/setup wipe:True` (Attention : cela efface l'historique Discord).
3. Vérifie que les messages dans `#notre-vision` et `#comment-ça-marche` sont bien mis à jour.

## 2. Test du Flux de Mission (Communauté)
L'objectif est de vérifier qu'une mission ne donne **pas d'argent** mais des points et une analyse publique.

1. **Création**: `/mission create titre:"Meilleur Hook Insta" description:"Trouve une accroche qui retient l'attention sur une vidéo de gaming."`
2. **Participation**: 
   - Utilise `/mission list` pour voir la mission.
   - Utilise `/mission claim id:1` (ou l'ID affiché).
3. **Soumission**: `/mission submit id:1 lien:"https://ton-lien-test.com"`
4. **Validation (Admin)**: 
   - Va dans le canal de validation.
   - Utilise `/validate id:1 note:"A+" feedback:"Top montage" analyse:"L'accroche à la 2ème seconde est parfaite pour la rétention."`
5. **Vérification**:
   - Vérifie que l'analyse est postée dans `#entraide-technique`.
   - Vérifie que tu as reçu un DM confirmant tes points.

## 3. Test de l'Affiliation (Finances)
L'objectif est de vérifier que les gains sont basés sur le modèle Tap.it.

1. **Stats**: Utilise `/stats` pour voir ton tableau de bord.
   - Tu devrais voir "Gains Affiliation" et "Clics estimés".
2. **Paiement**: Utilise `/pay view` pour voir le résumé de tes gains d'affiliation.
   - Vérifie la mention "Modèle 200€ les 1000 clics".

## 4. Test des Grades
1. Utilise une commande admin (ou modifie manuellement la BDD `farmer_league_bot.json`) pour augmenter tes points au-dessus de 500.
2. Valide une mission pour déclencher le passage au grade **Hustler**.
3. Vérifie l'annonce automatique dans `#notre-vision` ou `#accueil`.

---
🌾 **Bon farming !** Si une étape ne se passe pas comme prévu, dis-le moi.
