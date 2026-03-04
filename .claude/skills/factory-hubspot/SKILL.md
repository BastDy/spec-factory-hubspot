---
name: factory-hubspot
description: "Phase HUBSPOT - Génère projet HubSpot UI Extensions complet"
context: fork
allowed-tools: Read, Glob, Grep, Task, Bash, Write, Edit, Shell
---

# Factory HubSpot - Phase HUBSPOT

Tu es l'orchestrateur de la phase HubSpot.

## Workflow

1. Vérifier contexte HubSpot :
   bash
   grep -i "hubspot\|crm card\|ui extension" input/requirements.md


2. Vérifier Gate 2 (entrée) :
   bash
   node tools/gate-check.js 2 --json

   - Si status === "FAIL" → STOP immédiat.
   - Terminer avec : GATE_FAIL|2|<résumé erreurs>|0

3. Créer structure projet :
   bash
   mkdir -p agents/hubspot/project/src/app/extensions
   mkdir -p agents/hubspot/project/src/app/functions


4. Instrumenter la délégation :
   bash
   node tools/instrumentation/collector.js agent '{"agent":"hubspot","source":"factory-hubspot"}'
   # Obtenir le répertoire planning actif
node tools/get-planning-version.js
   # → passer le résultat dans le prompt de l'agent hubspot



5. Déléguer à l'agent hubspot via Task tool :

   Task(
     subagent_type: "hubspot",
     prompt: "Génère projet HubSpot UI Extensions complet.

     Lis d'abord :
     - docs/specs/system.md
     - docs/specs/domain.md
     - docs/specs/api.md

     Lis ensuite le planning généré par factory-plan :
      - node tools/get-planning-version.js  → pour obtenir le répertoire actif
      - docs/planning/vN/epics.md           → liste des épics
      - docs/planning/vN/us/US-*.md        → user stories
      - docs/planning/vN/tasks/TASK-.md   → tasks (priorité, DoD, contexte)

      IMPORTANT : Le code généré doit couvrir TOUTES les tasks du planning.
      Chaque TASK-*.md définit un composant ou une fonctionnalité à implémenter.


     Utilise les templates :
     - templates/hubspot/README-template.md
     - templates/hubspot/card-template.json
     - templates/hubspot/component-template.jsx

     Génère dans agents/hubspot/project/ :
     - README.md (wireframes ASCII)
     - package.json (@hubspot/ui-extensions)
     - hsconfig.json
     - src/app/extensions/*.json et *.jsx
     - src/app/functions/*.js (si API externe)
     - deploy.sh

     IMPORTANT - Wireframes ASCII obligatoires dans README :
     Format box-drawing (┌─┐│└┘)
     Montrer layout exact, données CRM, boutons

     IMPORTANT - React component :
     Utiliser hubspot.extend(() => <Component />)
     Importer depuis @hubspot/ui-extensions
     Gérer états : loading, error, empty",
     description: "HubSpot Agent - UI Extensions Project"
   )


6. Valider projet généré :
   bash
   test -f agents/hubspot/project/README.md || echo "ERREUR: README manquant"
   test -f agents/hubspot/project/package.json || echo "ERREUR: package.json manquant"
   grep -q "@hubspot/ui-extensions" agents/hubspot/project/package.json || echo "ERREUR: SDK manquant"
   grep -q "┌" agents/hubspot/project/README.md || echo "AVERTISSEMENT: Wireframe ASCII absent"


7. Logger via :
   bash
   node tools/factory-log.js "HUBSPOT" "completed" "Projet HubSpot généré dans agents/hubspot/project/"


8. Retourner résumé structuré :

   ✓ Projet HubSpot généré : agents/hubspot/project/
   ✓ Wireframes ASCII : README.md
   ✓ Cartes CRM : src/app/extensions/
   ✓ Serverless : src/app/functions/ (si applicable)

   Prochaines étapes :
   cd agents/hubspot/project
   npm install
   hs init
   hs project dev


## Protocole d'échec

- Gate d'entrée (Gate 2) : Si FAIL → STOP immédiat + marqueur GATE_FAIL|2|...|0
- Validation projet : Auto-remédiation 3x puis marqueur HUBSPOT_FAIL|...|3 si échec persistant
- Jamais de STOP silencieux — toujours retourner un rapport structuré

## Auto-remédiation

Tentative 1 : Corriger erreurs détectées
- README manquant → Relancer hubspot avec prompt : "Génère README.md avec wireframes ASCII"
- package.json manquant → Relancer hubspot avec prompt : "Génère package.json avec @hubspot/ui-extensions"
- Extensions manquantes → Relancer hubspot avec prompt : "Génère extensions/*.json et *.jsx"

Tentative 2 : Relancer agent complet
- Relancer Task hubspot entier

Tentative 3 : Si toujours FAIL, retourner rapport
- NE PAS continuer le pipeline
- Terminer avec : HUBSPOT_FAIL|<résumé erreurs>|3
