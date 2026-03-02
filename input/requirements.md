# Requirements — Data Quality Score (Carte HubSpot)


## 1. Contexte & Problème

Les équipes Sales et Ops dans HubSpot perdent du temps à identifier manuellement les fiches CRM incomplètes. Les données manquantes (email, téléphone, owner) ralentissent les actions commerciales et dégradent la qualité du CRM. Il n'existe pas d'indicateur visuel rapide sur les fiches contacts et companies pour évaluer la complétude des données critiques.


## 2. Objectifs métier (priorisés)

1. Réduire le temps d'identification des fiches incomplètes (gain : 5 min/fiche)
2. Augmenter le taux de complétude des champs critiques (+30% en 3 mois)
3. Améliorer la qualité globale du CRM (mesure : % de fiches avec score > 80%)


## 3. Utilisateurs / Personas

Persona 1 : Sales Rep
- Besoin : Savoir rapidement si un contact est "qualifiable" avant de l'appeler
- Pain point : Perd du temps à chercher les infos manquantes dans la fiche

Persona 2 : Operations Manager
- Besoin : Vue d'ensemble de la qualité des données du CRM
- Pain point : Pas d'indicateur actionnable sur les fiches


## 4. Parcours utilisateurs (User Journeys)

Journey 1 : Sales Rep consulte une fiche contact
1. Ouvre la fiche contact dans HubSpot
2. Voit immédiatement le score de qualité (67%) en sidebar
3. Identifie les champs manquants (phone, industry)
4. Clique sur "Compléter les champs"
5. Remplit les données manquantes
6. Score passe à 100%

Journey 2 : Ops Manager audite le CRM
1. Ouvre plusieurs fiches companies
2. Compare visuellement les scores (sidebar toujours visible)
3. Priorise les fiches à nettoyer (rouge/orange d'abord)


## 5. Fonctionnalités attendues (priorisées)

P0 - Score de complétude visuel
- Barre de progression avec % (0-100)
- Couleurs : vert (80-100%), orange (50-79%), rouge (0-49%)
- Calcul basé sur 6 champs critiques (contacts ou companies)

P0 - Liste des champs manquants
- Badges affichant les champs vides (ex: [Phone] [Industry])
- Couleur rouge/orange pour attirer l'attention

P1 - CTA "Compléter les champs"
- Bouton qui ouvre le formulaire d'édition HubSpot
- Utilise CrmActionButton du SDK

P2 - Bouton "Rafraîchir"
- Recharge le score après modification manuelle


## 6. Données manipulées

Types de données :
- Propriétés CRM standard HubSpot (contacts & companies)
- Pas de données sensibles stockées (lecture seule)
- Pas de PII exportée hors HubSpot

Champs analysés :

Contacts (6 champs) :
- firstname, lastname, email, phone, lifecyclestage, hubspot_owner_id

Companies (6 champs) :
- name, domain, industry, phone, country, hubspot_owner_id

Volumes estimés :
- Contacts : 10 000+
- Companies : 5 000+
- Calcul côté front (pas de base externe)


## 7. Contraintes non-fonctionnelles

Sécurité :
- Utiliser uniquement les scopes HubSpot minimaux (crm.objects.*.read)
- Pas de stockage externe des données CRM
- Respecter les permissions utilisateur HubSpot

Performance :
- Temps de chargement < 2 secondes
- Calcul du score instantané (pas d'appel API externe)

Accessibilité :
- Couleurs respectant les contrastes WCAG AA
- Labels explicites pour lecteurs d'écran

Délais :
- Livraison V1 : 2 semaines
- Test en production : 1 semaine

Budget :
- Pas de coût externe (100% HubSpot natif)


## 8. Hors-scope explicite

- Pas de détection de doublons (V2)
- Pas de correction automatique des données
- Pas de notifications email/Slack
- Pas de reporting global (dashboard)
- Pas d'analyse de sentiment ou scoring IA
- Pas d'intégration avec outils tiers (Salesforce, etc.)


## 9. Critères d'acceptation mesurables

KPI 1 : Temps d'identification
- Baseline : 5 min/fiche
- Cible : < 30 secondes/fiche
- Mesure : Temps entre ouverture fiche et identification champs manquants

KPI 2 : Taux de complétude
- Baseline : 60% de fiches avec score > 80%
- Cible : 90% de fiches avec score > 80%
- Mesure : Audit mensuel via API HubSpot

KPI 3 : Adoption
- Cible : 80% des sales utilisent la carte quotidiennement
- Mesure : Analytics HubSpot UI Extensions


## 10. Intégrations externes

Aucune intégration externe.

Intégrations HubSpot natives :
- SDK @hubspot/ui-extensions (composants UI)
- API CRM HubSpot (lecture propriétés via SDK)
- CRM Actions (ouvrir formulaire édition)


## 11. Stack / Préférences techniques

Obligatoire (HubSpot) :
- SDK : @hubspot/ui-extensions (dernière version stable)
- Framework : React 18+ (imposé par HubSpot)
- Langage : TypeScript strict
- Build : HubSpot CLI (hs project dev/upload)

Préférences :
- CSS : Inline styles ou Styled Components (pas de Tailwind dans UI Extensions)
- State : React hooks (useState, useEffect)
- Linter : ESLint avec config HubSpot
- Pas de librairie externe lourde (bundle size limité HubSpot)

Scopes hsconfig.json :
- crm.objects.contacts.read
- crm.objects.companies.read
- crm.schemas.contacts.read
- crm.schemas.companies.read


## 12. Qualité attendue

Tests :
- Couverture >= 70% (focus sur logique calcul score)
- Tests unitaires : useCompletenessScore hook
- Tests composant : DataQualityCard (loading, error, success states)

Code :
- TypeScript strict mode (pas de any)
- Zero magic number (constantes nommées pour seuils 80/50)
- DRY : logique contacts/companies factorisée
- Pas de console.log en production

Performance :
- Pas de re-render inutile (React.memo si nécessaire)
- Calcul score optimisé (pas de boucle sur toutes les props)

Documentation :
- README avec wireframe ASCII
- Commentaires JSDoc sur hooks custom
- Instructions install/deploy claires
