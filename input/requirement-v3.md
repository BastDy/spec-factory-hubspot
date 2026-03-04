# Requirements — Data Quality Card V3

## 1. Contexte & Problème
La V2 affiche les propriétés CRM d'un contact en lecture seule avec un score de complétude.
Le problème : l'utilisateur voit les champs vides mais ne peut pas les remplir depuis la card.
La V3 remplace le DescriptionList lecture seule par un CrmPropertyList natif HubSpot
qui gère l'édition inline automatiquement, sans serverless function.

## 2. Objectifs métier (priorisés)
1. Permettre à l'utilisateur de modifier une propriété CRM sans quitter la card
2. Mettre à jour le score de complétude immédiatement après une modification
3. Conserver l'affichage du score 🟡/🔴/🟢 au-dessus des propriétés

## 3. Utilisateurs / Personas
- Commercial HubSpot : utilise la card pour compléter les fiches contacts rapidement
- Rôle : non-admin (tous les utilisateurs peuvent éditer)

## 4. Parcours utilisateurs (User Journeys)
Scénario nominal :
1. L'utilisateur voit la card avec le score de complétude (ex: 🟡 50% — 4/8 champs)
2. Il clique sur un champ directement dans le CrmPropertyList
3. HubSpot ouvre l'édition inline nativement
4. Il saisit la nouvelle valeur et confirme
5. La propriété est sauvegardée automatiquement par HubSpot
6. Le bouton Rafraîchir permet de recalculer le score manuellement

## 5. Fonctionnalités attendues (priorisées)
P0 — Remplacer DescriptionList par CrmPropertyList
- Import depuis @hubspot/ui-extensions/crm
- Afficher les 8 champs contacts : firstname, lastname, email, phone,
  company, jobtitle, lifecyclestage, hubspot_owner_id
- direction="row" pour le layout 2 colonnes natif HubSpot

P0 — Conserver ProgressBar au-dessus du CrmPropertyList
- Score de complétude calculé par useCompletenessScore
- Emojis 🟢/🟡/🔴 selon le score
- Affichage X/N champs

P1 — Bouton Rafraîchir
- Appel de actions.refreshObjectProperties()
- Recalcule le score après modification

## 6. Données manipulées
- Propriétés CRM contacts : firstname, lastname, email, phone,
  company, jobtitle, lifecyclestage, hubspot_owner_id
- objectTypeId : "0-1" (contacts uniquement en V3)

## 7. Contraintes non-fonctionnelles
- Aucun HTML natif (<div>, <span>, style={{}})
- Uniquement composants HubSpot UI Extensions
- CrmPropertyList gère l'édition — pas de serverless function en V3
- Liste composants indicative (non exhaustive) :
  Text, Flex, Divider, DescriptionList, CrmPropertyList, Button, Alert

## 8. Hors-scope explicite
- Serverless function updateProperty.js → non nécessaire en V3
- EditableFieldRow avec états idle/editing/saving/success/error → non nécessaire
- useFieldEditor hook → non nécessaire
- Validation format email/téléphone
- Support companies → V4
- Historique des modifications → V4
- Config admin des champs → V4
- Select dynamique pour hubspot_owner_id → V4

## 9. Critères d'acceptation mesurables
- Un champ vide peut être édité et sauvegardé via CrmPropertyList
- Le score se met à jour après clic sur Rafraîchir
- En cas de type non supporté, un message d'erreur s'affiche sans crash
- Le layout s'affiche en 2 colonnes via direction="row"

## 10. Intégrations externes
- HubSpot CrmPropertyList gère l'écriture CRM nativement
- Aucun appel API supplémentaire nécessaire en V3

## 11. Stack / Préférences techniques
- React + JSX (HubSpot UI Extensions)
- @hubspot/ui-extensions pour composants UI
- @hubspot/ui-extensions/crm pour CrmPropertyList
- Pas de CSS inline, pas de HTML natif

## 12. Qualité attendue
- DataQualityCard simplifié — suppression de tout le code V2 commenté
- Zéro import mort dans le code final
- Le fichier data-quality-card.jsx (point d'entrée) ne change pas
