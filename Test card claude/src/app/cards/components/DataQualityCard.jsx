// // V2: DataQualityCard — Root polymorphic component with inline editing,
// // admin config panel, and modification history.

// import React, { useState, useCallback } from 'react';
// import {
//   Text,
//   Divider,
//   Alert,
//   Button,
//   Flex,
//   DescriptionList,
//   DescriptionListItem,
// } from '@hubspot/ui-extensions';
// import { CrmActionButton } from '@hubspot/ui-extensions/crm';
// import { useCompletenessScore } from '../hooks/useCompletenessScore';
// import { useFieldEditor } from '../hooks/useFieldEditor';
// import { useAdminConfig } from '../hooks/useAdminConfig';
// import { ProgressBar } from './ProgressBar';
// import { RefreshButton } from './RefreshButton';
// import { EditableFieldRow } from './EditableFieldRow';
// import { ConfigModal } from './ConfigModal';
// import { ModificationHistory } from './ModificationHistory';
// import { FIELD_CONFIG } from '../domain/constants';

// // Max modifications tracked in session (E15)
// const MAX_HISTORY_ENTRIES = 3;

// /**
//  * DataQualityCard — Root polymorphic component.
//  *
//  * V2 layout (vertical, spec):
//  *   Title [gear icon for admin] → ProgressBar (X/N fields) → EditableFieldRows
//  *   → ModificationHistory → CTA → RefreshButton
//  *
//  * States:
//  *   - loading          : Properties not yet available
//  *   - error_type       : Unknown objectType
//  *   - error_props      : Properties null or empty
//  *   - complete         : score === 100 — "Fiche complète"
//  *   - incomplete       : 0 <= score < 100 — editable rows + CTA
//  *
//  * @param {object} context    - HubSpot SDK context (crm.objectType, crm.objectId, user.roleType)
//  * @param {object} actions    - HubSpot SDK actions (refreshObjectProperties)
//  * @param {object} properties - CRM properties map from SDK
//  * @param {Function} runServerlessFunction - HubSpot SDK for calling serverless functions
//  */
// export function DataQualityCard({ context, actions, properties, error, settingsApi, runServerlessFunction }) {
//   const objectType = context?.crm?.objectTypeId;
//   const objectId = context?.crm?.objectId;
//   const isAdmin = context?.user?.roleType === 'ADMIN';

//   // V2: Admin config state
//   const [configModalOpen, setConfigModalOpen] = useState(false);

//   // V2: Modification history (max 3 entries, session memory)
//   const [modificationHistory, setModificationHistory] = useState([]);

//   // V2: Admin config hook
//   const { config: adminConfig, isSaving: isSavingConfig, error: configError, saveConfig, resetConfig } =
//     useAdminConfig(settingsApi);

//   const OBJECT_TYPE_MAP = {
//     'contacts': 'contacts',
//     'companies': 'companies',
//     '0-1': 'contacts',
//     '0-2': 'companies',
//   };
//   const normalizedType = OBJECT_TYPE_MAP[objectType] || null;
//   const isValidType = !!normalizedType;

//   const configuredFields = adminConfig
//     ? (normalizedType === 'contacts' ? adminConfig.contacts : adminConfig.companies)
//     : null;

//   // Rules of Hooks: useCompletenessScore must be called unconditionally.
//   // Pass null objectType/properties when in error state — hook handles it gracefully.
//   const { score, color, missingFields, isComplete, totalFields } = useCompletenessScore(
//     normalizedType || 'contacts',
//     properties || {},
//     configuredFields
//   );

//   const handleRefresh = () => {
//     actions?.refreshObjectProperties?.();
//   };

//   // V2: Callback when a field is saved successfully
//   const handleFieldSaved = useCallback((fieldName) => {
//     setModificationHistory((prev) => {
//       const newEntry = { fieldName, timestamp: Date.now(), objectType: normalizedType };
//       const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
//       return updated;
//     });
//   }, [normalizedType]);

//   // Error state: properties failed to load
//   if (error) {
//     return (
//       <Flex direction="column" gap="small">
//         <Text format={{ fontWeight: 'demibold' }}>Data Quality Score</Text>
//         <Divider />
//         <Alert variant="warning">{error}</Alert>
//         <RefreshButton onRefresh={handleRefresh} />
//       </Flex>
//     );
//   }

//   // Contexte chargé mais type non supporté → erreur
//   if (!isValidType) {
//     return (
//       <Flex direction="column" gap="small">
//         <Text format={{ fontWeight: 'demibold' }}>Data Quality Score</Text>
//         <Divider />
//         <Alert variant="warning">
//           Type d'objet non supporté: "{objectType}". Seuls contacts et companies sont pris en charge.
//         </Alert>
//         <RefreshButton onRefresh={handleRefresh} />
//       </Flex>
//     );
//   }

//   const objectLabel = normalizedType === 'contacts' ? 'Contact' : 'Company';

//   // All tracked fields (configured or default) for EditableFieldRow display
//   const trackedFields = configuredFields || FIELD_CONFIG[normalizedType] || [];

//   return (
//     <Flex direction="column" gap="small">
//       {/* Header with optional admin gear button */}
//       <Flex direction="row" justify="between" align="center">
//         <Text format={{ fontWeight: 'demibold' }}>
//           Data Quality Score — {objectLabel}
//         </Text>
//         {/* V2: Admin config button — visible only for ADMIN role */}
//         {isAdmin && (
//           <Button
//             variant="secondary"
//             size="small"
//             onClick={() => setConfigModalOpen(true)}
//             aria-label="Configurer les champs obligatoires (admin)"
//           >
//             ⚙
//           </Button>
//         )}
//       </Flex>

//       <Divider />

//       {/* Score progress bar with X/N display */}
//       <ProgressBar score={score} color={color} totalFields={totalFields} />

//       {/* V2: All tracked fields with inline editing */}
//       {isComplete ? (
//         <Text format={{ fontWeight: 'demibold' }}>✓ Fiche complète</Text>
//       ) : (
//         <DescriptionList direction="row">
//           {trackedFields.map((fieldName) => {
//             const value = properties[fieldName] ?? null;
//             const isEmpty = !value;
//             const label = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
//             return (
//               <DescriptionListItem key={fieldName} label={label}>
//                 <Text>{isEmpty ? '🔴 (vide)' : `🟢 ${value}`}</Text>
//               </DescriptionListItem>
//             );
//           })}
//         </DescriptionList>
//       )}

//       {/* V2: Modification history (max 3 entries) */}
//       <ModificationHistory history={modificationHistory} />

//       <Divider />

//       {/* CTA: open record editor — always shown alongside inline editing (D6) */}
//       {!isComplete && (
//         <CrmActionButton
//           actionType="OPEN_RECORD"
//           actionContext={{
//             objectTypeId: objectType,
//             objectId: objectId,
//           }}
//         >
//           Compléter les champs
//         </CrmActionButton>
//       )}

//       {/* Refresh button — always visible */}
//       <RefreshButton onRefresh={handleRefresh} />

//       {/* V2: Admin config modal */}
//       {isAdmin && (
//         <ConfigModal
//           open={configModalOpen}
//           config={adminConfig}
//           isSaving={isSavingConfig}
//           error={configError}
//           onSave={saveConfig}
//           onReset={resetConfig}
//           onClose={() => setConfigModalOpen(false)}
//           objectType={normalizedType}
//         />
//       )}
//     </Flex>
//   );
// }

// /**
//  * FieldEditorWrapper — Renders one EditableFieldRow with its own useFieldEditor instance.
//  * This pattern allows each field to have independent editing state.
//  */
// function FieldEditorWrapper({
//   fieldName,
//   properties,
//   objectType,
//   objectId,
//   color,
//   missingFields,
//   onSaveSuccess,
//   runServerlessFunction,
// }) {
//   const initialValue = properties[fieldName] ?? null;

//   // Detect field type from property name conventions
//   const fieldType = detectFieldType(fieldName);

//   // V2: saveFn wraps the HubSpot SDK CRM update call
//   const saveFn = runServerlessFunction
//     ? async (objType, objId, fname, value) => {
//         // Pattern: hubspot.crm.[contacts|companies].update via SDK
//         // In real deployment, this uses the HubSpot SDK CRM write methods.
//         // For now we use runServerlessFunction as the injection point.
//         await runServerlessFunction(`crm.${objType}.update`, {
//           objectId: objId,
//           properties: { [fname]: value },
//         });
//       }
//     : undefined;

//   const {
//     currentValue,
//     isEditing,
//     status,
//     errorMessage,
//     startEditing,
//     cancelEditing,
//     updateValue,
//     saveField,
//   } = useFieldEditor({
//     fieldName,
//     initialValue,
//     fieldType,
//     objectType,
//     objectId,
//     onSaveSuccess,
//     saveFn,
//   });

//   return (
//     <EditableFieldRow
//       fieldName={fieldName}
//       currentValue={isEditing ? currentValue : (properties[fieldName] ?? null)}
//       fieldType={fieldType}
//       isEditing={isEditing}
//       status={status}
//       errorMessage={errorMessage}
//       scoreColor={missingFields.includes(fieldName) ? color : 'green'}
//       onStartEditing={startEditing}
//       onCancelEditing={cancelEditing}
//       onUpdateValue={updateValue}
//       onSave={saveField}
//     />
//   );
// }

// /**
//  * Detects the field type for HubSpot standard fields.
//  * Returns 'text' for unknown fields.
//  */
// function detectFieldType(fieldName) {
//   const typeMap = {
//     lifecyclestage: 'select',
//     industry: 'select',
//     country: 'select',
//     hubspot_owner_id: 'owner',
//   };
//   return typeMap[fieldName] || 'text';
// }


// V3: DataQualityCard — Root polymorphic component
// Affiche le score de complétude et les propriétés CRM en lecture.
// L'édition inline viendra en V3 avec la serverless function.

import React, { useState } from 'react';
import {
  Text,
  Divider,
  Alert,
  Button,
  Flex,
  DescriptionList,
  DescriptionListItem,
} from '@hubspot/ui-extensions';
// CrmActionButton désactivé — réactivé en V3 avec serverless
// import { CrmActionButton } from '@hubspot/ui-extensions/crm';
import { useCompletenessScore } from '../hooks/useCompletenessScore';
import { useAdminConfig } from '../hooks/useAdminConfig';
import { ProgressBar } from './ProgressBar';
import { RefreshButton } from './RefreshButton';
import { ConfigModal } from './ConfigModal';
// FIELD_DISPLAY_NAMES ajouté pour DescriptionList
import { FIELD_CONFIG, FIELD_DISPLAY_NAMES } from '../domain/constants';

/**
 * DataQualityCard — Root polymorphic component.
 *
 * V3 layout (vertical, spec):
 *   Title [gear icon for admin] → ProgressBar (X/N fields) → DescriptionList
 *   → RefreshButton
 *
 * States:
 *   - error_props      : Properties failed to load
 *   - error_type       : Unknown objectType
 *   - complete         : score === 100 — "Fiche complète"
 *   - incomplete       : 0 <= score < 100 — DescriptionList read-only
 *
 * @param {object} context    - HubSpot SDK context (crm.objectTypeId, crm.objectId, user.roleType)
 * @param {object} actions    - HubSpot SDK actions (refreshObjectProperties)
 * @param {object} properties - CRM properties map from fetchCrmObjectProperties
 * @param {string|null} error - Error message if fetch failed
 * @param {object|null} settingsApi - HubSpot Settings API (null = use defaults)
 */
export function DataQualityCard({ context, actions, properties, error, settingsApi }) {
  const objectType = context?.crm?.objectTypeId;
  const isAdmin = context?.user?.roleType === 'ADMIN';

  // V2: Admin config modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // V2: Admin config hook — null settingsApi → fallback sur FIELD_CONFIG defaults
  const { config: adminConfig, isSaving: isSavingConfig, error: configError, saveConfig, resetConfig } =
    useAdminConfig(settingsApi);

  // Normalisation du type d'objet HubSpot (supporte les IDs et les noms)
  const OBJECT_TYPE_MAP = {
    'contacts': 'contacts',
    'companies': 'companies',
    '0-1': 'contacts',
    '0-2': 'companies',
  };
  const normalizedType = OBJECT_TYPE_MAP[objectType] || null;

  // Champs configurés par admin ou fallback sur FIELD_CONFIG
  const configuredFields = adminConfig
    ? (normalizedType === 'contacts' ? adminConfig.contacts : adminConfig.companies)
    : null;

  // Rules of Hooks: useCompletenessScore appelé inconditionnellement
  const { score, color, isComplete, totalFields } = useCompletenessScore(
    normalizedType || 'contacts',
    properties || {},
    configuredFields
  );

  const handleRefresh = () => actions?.refreshObjectProperties?.();

  // Error state: properties failed to load
  if (error) {
    return (
      <Flex direction="column" gap="small">
        <Alert variant="warning">{error}</Alert>
        <RefreshButton onRefresh={handleRefresh} />
      </Flex>
    );
  }

  // Type non supporté → erreur
  if (!normalizedType) {
    return (
      <Flex direction="column" gap="small">
        <Alert variant="warning">
          Type non supporté: "{objectType}". Seuls contacts et companies sont pris en charge.
        </Alert>
        <RefreshButton onRefresh={handleRefresh} />
      </Flex>
    );
  }

  const objectLabel = normalizedType === 'contacts' ? 'Contact' : 'Company';

  // Champs à afficher — configurés par admin ou défauts V1
  const trackedFields = configuredFields || FIELD_CONFIG[normalizedType] || [];

  return (
    <Flex direction="column" gap="small">

      {/* Header avec bouton admin (visible ADMIN uniquement) */}
      <Flex direction="row" justify="between" align="center">
        <Text format={{ fontWeight: 'demibold' }}>
          {objectLabel} — Score de complétude
        </Text>
        {/* Bouton config admin — visible uniquement roleType === ADMIN */}
        {isAdmin && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => setConfigModalOpen(true)}
            aria-label="Configurer les champs obligatoires (admin)"
          >
            ⚙
          </Button>
        )}
      </Flex>

      <Divider />

      {/* Score de complétude avec X/N champs */}
      <ProgressBar score={score} color={color} totalFields={totalFields} />

      <Divider />

      {/* Champs en grille 2 colonnes via DescriptionList */}
      {isComplete ? (
        <Text format={{ fontWeight: 'demibold' }}>✓ Fiche complète</Text>
      ) : (
        <DescriptionList direction="row">
          {trackedFields.map((fieldName) => {
            const value = properties[fieldName] ?? null;
            const isEmpty = !value;
            const label = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
            return (
              <DescriptionListItem key={fieldName} label={label}>
                <Text>{isEmpty ? '🔴 (vide)' : `🟢 ${value}`}</Text>
              </DescriptionListItem>
            );
          })}
        </DescriptionList>
      )}

      <Divider />

      {/* CTA désactivé — réactivé en V3 avec serverless */}
      {/* {!isComplete && <CrmActionButton ...>Compléter les champs</CrmActionButton>} */}

      {/* Refresh button — toujours visible */}
      <RefreshButton onRefresh={handleRefresh} />

      {/* Modal config admin — V2, visible ADMIN uniquement */}
      {isAdmin && (
        <ConfigModal
          open={configModalOpen}
          config={adminConfig}
          isSaving={isSavingConfig}
          error={configError}
          onSave={saveConfig}
          onReset={resetConfig}
          onClose={() => setConfigModalOpen(false)}
          objectType={normalizedType}
        />
      )}
    </Flex>
  );
}
