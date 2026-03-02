# Requirements V2 — Data Quality Score (Carte HubSpot)


## 1. Contexte & Problème

La V1 de la carte Data Quality Score affiche le score et les champs manquants sous forme de badges simples. Les utilisateurs ont besoin de :
1. Voir et modifier directement les champs manquants depuis la carte (sans ouvrir le formulaire complet)
2. Personnaliser la liste des champs obligatoires selon leurs besoins métier (actuellement hard-codés)


## 2. Objectifs métier (priorisés)

1. Réduire le temps de complétion des fiches (gain : édition inline au lieu d'ouvrir formulaire)
2. Permettre aux admins CRM de configurer leurs propres règles de qualité
3. Améliorer l'adoption de la carte (plus actionnable)


## 3. Utilisateurs / Personas

Persona 1 : Sales Rep (utilisateur final)
- Besoin : Compléter rapidement les champs manquants sans quitter la carte
- Pain point V1 : Doit cliquer sur "Compléter les champs" → formulaire lourd

Persona 2 : CRM Admin / Ops Manager (configurateur)
- Besoin : Définir quels champs sont "obligatoires" selon son process métier
- Pain point V1 : Champs hard-codés dans le code (firstname, lastname, email, phone, lifecyclestage, hubspot_owner_id)


## 4. Parcours utilisateurs (User Journeys)

Journey 1 : Sales Rep complète un champ manquant inline
1. Ouvre fiche contact avec score 67%
2. Voit "Phone manquant" en badge rouge
3. Clique sur le badge → champ éditable apparaît directement dans la carte
4. Tape le numéro de téléphone
5. Clique "Sauvegarder" → score passe à 83%
6. Pas besoin d'ouvrir le formulaire complet

Journey 2 : CRM Admin configure les champs obligatoires
1. Ouvre la carte Data Quality Score
2. Clique sur "⚙️ Configurer"
3. Voit la liste des champs disponibles (contacts : firstname, lastname, email, phone, lifecyclestage, hubspot_owner_id, jobtitle, company, mobilephone...)
4. Coche/décoche les champs qu'il veut inclure dans le score
5. Sauvegarde → tous les sales voient le nouveau score personnalisé


## 5. Fonctionnalités attendues (priorisées)

P0 - Afficher les valeurs actuelles des champs sous les badges
- Au lieu de juste [Phone manquant], afficher :
  Phone : [________] (vide)
  Industry : Marketing
  Owner : John Doe
- Format : Nom du champ + valeur actuelle (si rempli) ou "(vide)" si manquant

P0 - Modifier les champs directement dans la carte
- Cliquer sur un champ → devient éditable (input text, select, etc.)
- Bouton "Sauvegarder" → appelle l'API HubSpot pour mettre à jour la propriété
- Bouton "Annuler" → revient à la valeur initiale
- Feedback visuel : spinner pendant sauvegarde, checkmark si succès, erreur si échec

P1 - Panneau de configuration des champs obligatoires
- Bouton "⚙️ Configurer" en haut de la carte (visible uniquement pour admins CRM)
- Modal ou section dépliable avec :
  - Liste de tous les champs disponibles (contacts : 20+ champs standard)
  - Checkbox pour chaque champ
  - Séparation Contacts / Companies (2 configs distinctes)
- Sauvegarde dans une custom property HubSpot (ex : data_quality_config_contacts de type JSON) ou dans le localStorage (moins durable)

P2 - Historique des modifications
- Afficher "Dernière modification : Phone mis à jour il y a 2 min par Bastien"
- Limité aux 3 dernières modifications


## 6. Données manipulées

Types de données :
- Propriétés CRM standard HubSpot (lecture + écriture)
- Custom property pour config : data_quality_config_contacts (JSON)
- Custom property pour config : data_quality_config_companies (JSON)

Exemple de config JSON stockée :
{
  "requiredFields": ["firstname", "lastname", "email", "phone", "lifecyclestage", "hubspot_owner_id", "jobtitle"],
  "weights": {
    "email": 2,
    "phone": 1,
    "lifecyclestage": 1
  }
}

Volumes :
- Modification de 1-3 champs par utilisation
- Config modifiée 1 fois/mois par admin


## 7. Contraintes non-fonctionnelles

Sécurité :
- Scopes supplémentaires requis : crm.objects.contacts.write, crm.objects.companies.write
- Vérifier permissions utilisateur avant d'afficher champs éditables (si read-only → afficher mais griser)
- Configuration réservée aux admins CRM (rôle HubSpot : Super Admin ou Custom Admin avec scope)

Performance :
- Sauvegarde d'un champ : < 1 seconde
- Pas de sauvegarde automatique (uniquement sur clic bouton)

UX :
- Afficher spinner pendant sauvegarde
- Toast/notification de succès ou erreur
- Annuler doit restaurer la valeur initiale

Accessibilité :
- Champs éditables accessibles au clavier (Tab, Enter pour sauvegarder)


## 8. Hors-scope explicite

- Pas de validation métier complexe (ex : format email, téléphone) → déléguer à HubSpot API
- Pas de modification en masse (bulk edit)
- Pas de workflow automation déclenché après modification
- Pas de notifications Slack/email après modification
- Pas de gestion des permissions granulaires par champ (HubSpot gère ça)


## 9. Critères d'acceptation mesurables

KPI 1 : Temps de complétion réduit
- Baseline : 2 min pour ouvrir formulaire + compléter 2 champs
- Cible : 30 secondes pour compléter 2 champs inline
- Mesure : Tracking temps entre clic badge et sauvegarde

KPI 2 : Taux d'adoption de l'édition inline
- Cible : 60% des modifications de champs passent par la carte (vs formulaire)
- Mesure : Analytics HubSpot UI Extensions

KPI 3 : Personnalisation de la config
- Cible : 80% des portails modifient la config par défaut dans les 2 semaines
- Mesure : Custom property data_quality_config_contacts remplie


## 10. Intégrations externes

API HubSpot :
- PATCH /crm/v3/objects/contacts/{contactId} (mise à jour propriétés)
- PATCH /crm/v3/objects/companies/{companyId} (mise à jour propriétés)
- GET /crm/v3/properties/contacts (liste des champs disponibles pour config)
- GET /crm/v3/properties/companies (liste des champs disponibles pour config)


## 11. Stack / Préférences techniques

Obligatoire (HubSpot) :
- SDK : @hubspot/ui-extensions (dernière version stable)
- Framework : React 18+ avec hooks
- Langage : TypeScript strict

Nouveaux composants SDK :
- Input : Champs texte éditables
- Select : Dropdown pour lifecyclestage, owner
- Modal ou Accordion : Panneau de configuration
- Toast ou Alert : Feedback sauvegarde

État local :
- useState pour champs en cours d'édition
- useEffect pour recharger après sauvegarde

API calls :
- hubspot.actions.updateCrmObjectProperties() (si disponible dans SDK)
- Sinon : fonction serverless src/app/functions/update-property.js


## 12. Qualité attendue

Tests :
- Couverture >= 70%
- Tests unitaires : hook useEditableField (édition + sauvegarde + annulation)
- Tests composant : EditableFieldRow (affichage + interaction)
- Tests E2E : Scénario complet "modifier phone → sauvegarder → score recalculé"

Code :
- TypeScript strict (pas de any)
- Constantes pour messages d'erreur (pas de hardcoded strings)
- Séparation concerns : useFieldEditor hook distinct de useCompletenessScore

Documentation :
- README mis à jour avec captures d'écran édition inline
- Commentaires JSDoc sur nouveaux hooks
- Guide admin pour configurer les champs


## 13. Wireframe ASCII V2

┌─────────────────────────────────────┐
│ Data Quality Score          [⚙️]    │
├─────────────────────────────────────┤
│ Score : 67% 🟠                      │
│ [████████░░░░] 4/6 champs           │
│                                     │
│ Champs :                            │
│ ✓ Email : bh@hubspot.com            │
│ ✓ Company : HubSpot                 │
│ ✗ Phone : [__________] 💾           │
│ ✗ Owner : [Select...▼] 💾           │
├─────────────────────────────────────┤
│ [Rafraîchir]                        │
└─────────────────────────────────────┘

Modal Config (si clic ⚙️) :
┌─────────────────────────────────────┐
│ Configuration - Contacts            │
├─────────────────────────────────────┤
│ Champs obligatoires :               │
│ ☑ Email                             │
│ ☑ Phone                             │
│ ☑ Lifecycle Stage                   │
│ ☑ Owner                             │
│ ☐ Job Title                         │
│ ☐ Mobile Phone                      │
├─────────────────────────────────────┤
│ [Annuler] [Sauvegarder]             │
└─────────────────────────────────────┘


## 14. Migration depuis V1

- Pas de breaking change : la V1 continue de fonctionner
- Si custom property data_quality_config_contacts absente → utiliser config par défaut V1 (6 champs)
- Déploiement progressif : activer édition inline par défaut, config admin en beta
