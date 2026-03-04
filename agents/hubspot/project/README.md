# Data Quality Card V3 — HubSpot UI Extension

## Description

Extension CRM HubSpot affichant un score de complétude des propriétés contact avec édition inline native via CrmPropertyList.

- Score de complétude (ProgressBar + emoji 🔴/🟡/🟢)
- Affichage et édition inline des 8 propriétés contact via CrmPropertyList natif
- Bouton Rafraîchir pour recalculer le score après édition

## Wireframes ASCII

### Layout principal (fiche contact)

```
┌──────────────────────────────────────────────────┐
│  Data Quality Card                               │
├──────────────────────────────────────────────────┤
│  ██████████████████░░░░░░░░░░  (ProgressBar)     │
│  🟡 4/8                        (score + emoji)  │
│  ─────────────────────────────────────────────   │
│                                                  │
│  Prénom         │  Nom                           │
│  ─────────────────────────────────────────────   │
│  Email          │  Téléphone                     │
│  ─────────────────────────────────────────────   │
│  Entreprise     │  Poste                         │
│  ─────────────────────────────────────────────   │
│  Lifecycle      │  Propriétaire                  │
│                                                  │
├──────────────────────────────────────────────────┤
│  [ Rafraîchir ]                                  │
└──────────────────────────────────────────────────┘
```

### État score complet (🟢 8/8)

```
┌──────────────────────────────────────────────────┐
│  ████████████████████████████  (ProgressBar 100%)│
│  🟢 8/8                                          │
│  ─────────────────────────────────────────────   │
│  [CrmPropertyList — 8 champs renseignés]         │
│                                                  │
│  [ Rafraîchir ]                                  │
└──────────────────────────────────────────────────┘
```

### État score faible (🔴 2/8)

```
┌──────────────────────────────────────────────────┐
│  ██████░░░░░░░░░░░░░░░░░░░░░░  (ProgressBar 25%) │
│  🔴 2/8                                          │
│  ─────────────────────────────────────────────   │
│  [CrmPropertyList — 6 champs vides à compléter]  │
│                                                  │
│  [ Rafraîchir ]                                  │
└──────────────────────────────────────────────────┘
```

### Propriétés CRM affichées (8 champs contacts)

| Propriété CRM | Label affiché |
|---------------|---------------|
| `firstname` | Prénom |
| `lastname` | Nom |
| `email` | Email |
| `phone` | Téléphone |
| `company` | Entreprise |
| `jobtitle` | Poste |
| `lifecyclestage` | Étape cycle de vie |
| `hubspot_owner_id` | Propriétaire HubSpot |

## Architecture

```
src/
└── app/
    ├── app.json                          (config app HubSpot)
    ├── app-hsmeta.json                   (config hsmeta app)
    ├── cards/
    │   ├── data-quality-card.jsx         (composant principal V3)
    │   └── data-quality-card-hsmeta.json (config card)
    └── extensions/
        └── data-quality-card.jsx         (alias — même fichier)
```

## Installation

```bash
npm install
hs init
```

## Développement local

```bash
hs project dev
```

## Déploiement

```bash
hs project upload
```

## Propriétés CRM utilisées

- `firstname` : Prénom du contact
- `lastname` : Nom du contact
- `email` : Email du contact
- `phone` : Téléphone du contact
- `company` : Entreprise du contact
- `jobtitle` : Poste du contact
- `lifecyclestage` : Étape du cycle de vie CRM
- `hubspot_owner_id` : Propriétaire HubSpot du contact

## Actions disponibles

- Score de complétude : calculé automatiquement au chargement depuis les propriétés du contexte HubSpot
- Édition inline : clic sur un champ dans CrmPropertyList → éditeur natif HubSpot
- Rafraîchir : recalcul du score via `actions.refreshObjectProperties()`

## Emplacement CRM

- Type : crm-card
- Location : crm.record.tab
- Objets : contacts

## Décisions techniques

- **D1** : CrmPropertyList natif remplace DescriptionList
- **D2** : Pas de serverless function (édition gérée par HubSpot)
- **D3** : Pas de composant EditableFieldRow ni hook useFieldEditor
- **D7** : Architecture plate (flat) — un fichier principal + hook inline
