# Requirements — Data Quality Card V4

## 1. Contexte & Problème
La V3 fonctionne sur les contacts avec CrmPropertyList + score de complétude.
3 problèmes à résoudre :
1. Bug score : champ phone avec préfixe pays (+33) considéré comme rempli à tort
2. La card ne fonctionne que sur les contacts
3. Pas de paramétrage possible pour l'utilisateur

## 2. Objectifs métier (priorisés)
1. Corriger le bug score sur champ phone (préfixe pays seul)
2. Étendre la card aux Companies et Deals
3. Permettre à l'utilisateur de configurer les champs via la page Settings native HubSpot

## 3. Etat du projet
- La page Settings a déjà été générée via `hs project add`
- Les fichiers existent dans `src/app/settings/` :
  - `*-hsmeta.json`
  - `SettingsPage.jsx`
  - `package.json`
- Ces fichiers sont à MODIFIER, pas à créer

## 4. Fonctionnalités attendues (priorisées)

### P0 — Bug fix : champ phone avec préfixe pays
- HubSpot injecte automatiquement +33 (ou autre préfixe pays) dans les champs
  de type Phone Number, même quand l'utilisateur n'a rien saisi
- `useCompletenessScore` doit détecter ce cas et le traiter comme vide
- Règle : si la valeur correspond uniquement à un préfixe pays `/^\+\d{1,3}$/`
  → considérer comme vide
- S'applique aux champs `phone` de tous les types d'objets

### P0 — Support multi-objets
- La card lit `context.crm.objectTypeId` pour adapter dynamiquement
  les champs et l'objectTypeId de CrmPropertyList
- Contacts (`0-1`) : `firstname`, `lastname`, `email`, `phone`,
  `company`, `jobtitle`, `lifecyclestage`, `hubspot_owner_id`
- Companies (`0-2`) : `name`, `domain`, `phone`, `country`,
  `industry`, `hubspot_owner_id`
- Deals (`0-3`) : `dealname`, `amount`, `closedate`, `pipeline`,
  `dealstage`, `hubspot_owner_id`
- La card doit être déclarée dans `*-hsmeta.json` pour les 3 objectTypes

### P1 — Page Settings native HubSpot
- Fichiers déjà présents dans `src/app/settings/` (générés via `hs project add`)
- Permet à l'utilisateur de choisir quels champs comptent dans le score
  par type d'objet (contacts / companies / deals)
- Sauvegarde via serverless function `src/app/functions/settings.js`
- La card recharge la config au clic Rafraîchir

## 5. Architecture attendue
src/app/
├── cards/
│ └── data-quality-card.jsx ← UPDATE (multi-objets + bug fix)
├── settings/
│ ├── *-hsmeta.json ← UPDATE (déjà créé)
│ ├── SettingsPage.jsx ← UPDATE (déjà créé)
│ └── package.json ← UPDATE (déjà créé)
└── functions/
└── settings.js ← CREATE (save/load config)


## 6. Hors-scope explicite
- Recalcul automatique du score sans bouton Rafraîchir → V5
- Historique des modifications → Hors scope
- Custom objects → V5
- Validation format numéro de téléphone complet → V5

## 7. Contraintes non-fonctionnelles
- Zéro HTML natif (`<div>`, `<span>`, `style={{}}`)
- Uniquement composants `@hubspot/ui-extensions`
- Settings via fichiers existants (`hs project add` déjà fait)

## 8. Critères d'acceptation
- Score recalculé correctement si phone = "+33" seul → compté comme vide
- Card affiche les bons champs selon le type d'objet ouvert (contact/company/deal)
- Page Settings accessible via Marketplace → Connected apps → Settings
- Config sauvegardée persiste entre sessions
- Bouton Rafraîchir recharge la config Settings + recalcule le score

## 9. Stack / Préférences techniques
- React + JSX (HubSpot UI Extensions)
- `@hubspot/ui-extensions` pour composants UI
- `@hubspot/ui-extensions/crm` pour CrmPropertyList et useCrmProperties
- Pas de CSS inline, pas de HTML natif

## 10. Qualité attendue
- Zéro import mort dans le code final
- Zéro code commenté
