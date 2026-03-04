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

3. Détecter projet HubSpot existant :
   bash
  # AVANT (détection automatique - ne marche pas)
  HS_PROJECT=$(find . -name "hsproject.json" -not -path "*/node_modules/*" -maxdepth 4 2>/dev/null | head -1 | xargs -I{} dirname {})
  if [ -z "$HS_PROJECT" ]; then echo "ERREUR: Aucun projet HubSpot trouvé"; exit 1; fi

  # APRÈS (hardcodé - fonctionne toujours)
  HS_PROJECT="Test card claude"
  if [ ! -f "$HS_PROJECT/hsproject.json" ]; then
    echo "ERREUR: $HS_PROJECT/hsproject.json introuvable";
    exit 1;
  fi
  echo "Projet HubSpot ciblé: $HS_PROJECT"



4. Instrumenter la délégation :
   bash
   node tools/instrumentation/collector.js agent '{"agent":"hubspot","source":"factory-hubspot"}'
   # Obtenir le répertoire planning actif
node tools/get-planning-version.js
   # → passer le résultat dans le prompt de l'agent hubspot



5. Déléguer à l'agent hubspot via Task tool :

   Task(
     subagent_type: "hubspot",
     prompt: "Travaille dans le projet HubSpot existant détecté.

     IMPORTANT : Le projet HubSpot EXISTE DÉJÀ. Ne crée pas de nouveau projet.
     Le répertoire du projet est celui contenant hsproject.json (ex: 'Test card claude/').

     Lis d'abord les specs :
     - docs/specs/system.md
     - docs/specs/domain.md
     - docs/specs/api.md

     Lis ensuite le planning :
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

     IMPORTANT - React component :
     Utiliser hubspot.extend(() => <Component />)
     Importer depuis @hubspot/ui-extensions
     Gérer états : loading, error, empty
     Lire les propriétés depuis useCrmProperties,
     description: "HubSpot Agent - UI Extensions Project"
   )


6. Valider projet généré :
   bash
  HS_PROJECT="Test card claude"


7. Logger via :
   bash
  HS_PROJECT="Test card claude"


8. Retourner résumé structuré :

   ✓ Projet HubSpot mis à jour dans : [chemin détecté via hsproject.json]
   ✓ Cards CRM : src/app/cards/
   ✓ Tests : src/__tests__/

   Prochaines étapes :
   cd [projet]
   npm test
   hs project dev


## Protocole d'échec

- Gate d'entrée (Gate 2) : Si FAIL → STOP immédiat + marqueur GATE_FAIL|2|...|0
- Validation projet : Auto-remédiation 3x puis marqueur HUBSPOT_FAIL|...|3 si échec persistant
- Jamais de STOP silencieux — toujours retourner un rapport structuré

## Auto-remédiation

Tentative 1 : Corriger erreurs détectées
- Cards manquantes → Relancer hubspot avec prompt : "Génère les cards JSX manquantes dans src/app/cards/"
- Tests manquants → Relancer hubspot avec prompt : "Génère les tests dans src/__tests__/"
- hsmeta manquant → Relancer hubspot avec prompt : "Génère les fichiers *-hsmeta.json"

Tentative 2 : Relancer agent complet
- Relancer Task hubspot entier

Tentative 3 : Si toujours FAIL, retourner rapport
- NE PAS continuer le pipeline
- Terminer avec : HUBSPOT_FAIL|<résumé erreurs>|3
