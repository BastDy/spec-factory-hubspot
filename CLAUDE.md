# CLAUDE.md — Spec-to-Code Factory

## Vision
Pipeline automatisé qui transforme un requirements.md en projet livrable.

## Workflow obligatoire
```
       BREAK → MODEL → ACT → DEBRIEF
  │      │        │       │       │
Gate 0  Gate 1  Gate 2  Gate 3+4  Gate 5
```

### Validations par Gate
| Gate | Phase | Validations |
|------|-------|-------------|
| 0 | →BREAK | **requirements.md complet** (12 sections obligatoires) |
| 1 | BREAK→MODEL | Fichiers brief/scope/acceptance + **structure projet** |
| 2 | MODEL→ACT | Specs + ADR + **scan secrets/PII** |
| 3 | PLAN→BUILD | Epics + US + Tasks avec DoD |
| 4 | BUILD→QA | Tests passants + **code quality strict** + **app assembly** + **boundary check** |
| 5 | QA→RELEASE | QA report + checklist + CHANGELOG + **export release** |

### Comportement des Gates
- **Mode JSON** : `node tools/gate-check.js <N> --json` retourne `{ gate, status, errors[], summary }` avec classification (`category`, `fixable`)
- **Gate d'entree** (prereq phase) : Si FAIL → STOP immediat, marqueur `GATE_FAIL|<N>|<erreurs>|0`
- **Gate de sortie** (outputs phase) : Auto-remediation 3x puis `GATE_FAIL|<N>|<erreurs>|3`
- **Orchestrateur** : Detecte `GATE_FAIL` et propose a l'utilisateur : relancer / corriger / abandonner

## Phases
1. **BREAK** : Normaliser le besoin → brief + scope + acceptance
2. **MODEL** : Spécifier → specs + ADR + rules
3. **ACT** : Planifier + Construire → epics + US + tasks + code + tests
4. **DEBRIEF** : Valider + Livrer → QA + checklist + CHANGELOG

## Invariants (ABSOLUS)
- **No Spec, No Code** : Pas de code sans specs validées
- **No Task, No Commit** : Chaque commit référence TASK-XXXX
- **Tasks auto-suffisantes** : Chaque task est 100% indépendante (principe BMAD)

## Conventions de nommage
- Epics : `EPIC-XXX` (dans `docs/planning/epics.md`)
- User Stories : `US-XXXX-titre.md`
- Tasks : `TASK-XXXX-titre.md`
- ADR : `ADR-XXXX-titre.md`

## Commands disponibles
### Skills (workflows)
- `/factory-intake` : Phase BREAK
- `/factory-spec` : Phase MODEL
- `/factory-plan` : Phase ACT (planning)
- `/factory-build` : Phase ACT (build)
- `/factory-qa` : Phase DEBRIEF
- `/factory` : Pipeline complet (auto-detect greenfield V1 / brownfield V2+)
- `/factory-quick` : Quick fix/tweak sans pipeline complet (BMAD Quick Flow)
- `/factory-resume` : Reprend le pipeline apres interruption
- `/gate-check [0-5]` : Verifie un gate
- `/clean` : Remet le projet en état "starter" (supprime tous les artefacts)

### Commands
- `/status` : État du pipeline (dashboard détaillé)
- `/reset [phase]` : Réinitialise une phase
- `/help` : Affiche l'aide

## Outils de support
- `tools/validate-requirements.js` : Validation requirements.md complet (Gate 0)
- `tools/factory-state.js` : Gestion de l'etat machine-readable + compteurs
- `tools/factory-reset.js` : Reset des phases
- `tools/detect-requirements.js` : Detection automatique du dernier requirements-N.md
- `tools/get-planning-version.js` : Obtenir le repertoire planning actif (vN)
- `tools/set-current-task.js` : Tracking de la task courante
- `tools/validate-code-quality.js` : Validation code vs specs (mode STRICT)
- `tools/validate-structure.js` : Validation structure projet (Gate 1)
- `tools/scan-secrets.js` : Scan secrets et PII (Gate 2)
- `tools/validate-app-assembly.js` : Validation assemblage App.tsx (Gate 4) - **supporte Clean Arch**
- `tools/validate-boundaries.js` : Validation des regles d'import inter-couches (Gate 4)
- `tools/export-release.js` : Export du projet livrable (Gate 5)
- `tools/list-active-adrs.js` : Listing et filtrage des ADR (actifs, superseded, par version)
- `tools/extract-version-delta.js` : Extraction du delta d'une version depuis les specs (inline + marqueurs de bloc)
- `tools/verify-pipeline.js` : Verification post-pipeline complete (toutes phases)
- `tools/clean.js` : Reset projet en etat starter (`--force`, `--dry-run`)

## Permissions simplifiées

Les permissions dans `.claude/settings.json` ont été simplifiées pour réduire les prompts :

```json
"permissions": {
  "allow": ["Read(*)", "Write(*)", "Edit(*)", "Glob(*)", "Grep(*)", "Bash(node tools/*)", ...],
  "ask": ["Bash(git add:*)", "Bash(git commit:*)"],
  "deny": ["Read(.env)", "Write(.env)", ...]
}
```

Seuls les commits git demandent confirmation. Les opérations Read/Write/Edit sont autorisées par défaut.

## Hook Git optionnel

`tools/validate-commit-msg.js` valide le format des commits (TASK-XXXX: description).

**Installation (optionnel)** :
```bash
# Avec Husky
npx husky add .husky/commit-msg "node tools/validate-commit-msg.js $1"

# Ou manuellement
echo 'node tools/validate-commit-msg.js "$1"' > .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

## Instrumentation (optionnel)

Le pipeline peut tracer tous les événements pour debugging ou audit.

**Activation** dans `.claude/settings.json` :
```json
"env": {
  "FACTORY_INSTRUMENTATION": "true"
}
```

**Evenements trackes** :

Les evenements sont collectes par deux mecanismes complementaires :
- **Hooks** (automatiques) : evenements generiques fires par Claude Code
- **Tools** (explicites) : evenements metier qui necessitent le resultat de l'operation

| Type | Description | Source | Mecanisme |
|------|-------------|--------|-----------|
| `tool_invocation` | Invocation d'un tool | `pretooluse-security.js` | Hook |
| `file_written` | Fichier ecrit | `posttooluse-validate.js` | Hook |
| `template_used` | Template lu depuis templates/ | `pretooluse-security.js` | Hook |
| `skill_invoked` | Skill invoquee | `pretooluse-skill.js` | Hook |
| `phase_started` | Debut de phase | `pretooluse-skill.js` | Hook |
| `agent_delegated` | Delegation agent | `subagentstart-track.js` | Hook |
| `gate_checked` | Verification gate (0-5) | `gate-check.js` | Tool |
| `phase_completed` | Fin de phase | `factory-log.js` | Tool |
| `task_completed` | Tache implementee | `set-current-task.js` | Tool |

**Commandes** :
```bash
node tools/instrumentation/collector.js status       # État
node tools/instrumentation/collector.js summary      # Résumé
node tools/instrumentation/collector.js reset        # Réinitialiser
node tools/instrumentation/collector.js template     # Enregistrer usage template
node tools/instrumentation/coverage.js               # Couverture pipeline
node tools/instrumentation/reporter.js               # Rapport markdown
```

**Output** :
- `docs/factory/instrumentation.json` - Événements (append-only)
- `docs/factory/coverage-report.md` - Rapport de couverture

**Configuration centralisée** : `tools/instrumentation/config.js`
- Namespace `claude.env` pour toutes les variables factory
- Chargé automatiquement depuis `.claude/settings.json`

## Validation Code Quality (Gate 4)

Validation stricte du code genere : tests (>=80% lignes, >=75% branches, >=85% fonctions), TypeScript strict, conformite specs API/Domain, app assembly, boundaries architecturales.
Seuils configurables dans `project-config.json`. Usage : `node tools/validate-code-quality.js --gate4`.

## Configuration Projet (project-config.json)

Genere par l'Architect (phase MODEL). Centralise chemins et seuils de validation.
Emplacement : `docs/factory/project-config.json`. Template : `templates/specs/project-config.json`.
Les tools (`gate-check.js`, `validate-*.js`) lisent cette config au lieu de valeurs hardcodees.

## Independence des Tasks (BMAD)

Chaque task est **100% auto-suffisante** (contexte complet, code existant, tests attendus).
Le developpeur peut implementer une task SANS connaitre les autres. Template : `templates/planning/task-template.md`.

## Export Release (Gate 5)

`node tools/export-release.js` separe le projet livrable de l'infrastructure factory (exclusion-based).
Output dans `release/` avec README enrichi depuis les specs. Manifeste dans `docs/factory/release-manifest.json`.

## Evolution de projet (V2+)

Le pipeline supporte l'evolution incrementale. `/factory` auto-detecte le mode (greenfield V1 / brownfield V2+).

### Strategie par type de document
| Document | V1 | V2+ |
|----------|----|----|
| brief, scope, acceptance | CREATE | EDIT (enrichir) |
| specs (system, domain, api) | CREATE | EDIT (mettre a jour) |
| planning | CREATE v1/ | CREATE v2/ |
| ADR | CREATE | CREATE (nouveau) + EDIT status ancien |
| QA reports | CREATE | CREATE (report-vN.md) |
| CHANGELOG | CREATE | EDIT (prepend) |

En brownfield, les agents encadrent chaque ajout avec des marqueurs `<!-- VN:START -->` / `<!-- VN:END -->`.
Les compteurs (EPIC, US, TASK, ADR) sont continus entre versions via `factory-state.js counter`.
Voir `input/README.md` pour les conventions de nommage des requirements.

## Quick Flow (BMAD)

`/factory-quick` pour les modifications mineures (<=3 fichiers, pas de nouveau concept metier/endpoint/regle).
Si la modification impacte les specs, le skill propose de generer `requirements-N.md` et basculer vers `/factory`.

## Limites
- Stack-agnostic (projet cible defini par ADR)
- Pas de CI/CD integre (GitHub Actions a ajouter manuellement)

## Templates et Rules

Les templates sont dans `templates/` (break, specs, adr, planning, qa, release).
Chaque agent connait ses templates depuis sa fiche dans `.claude/agents/`.

Les rules dans `.claude/rules/` sont auto-chargees par Claude Code selon les `paths:` definis.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->