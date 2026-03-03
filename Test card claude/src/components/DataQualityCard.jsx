// V2: DataQualityCard — Root polymorphic component with inline editing,
// admin config panel, and modification history.

import React, { useState, useCallback } from 'react';
import {
  Text,
  Divider,
  CrmActionButton,
  Alert,
  Button,
  Flex,
} from '@hubspot/ui-extensions';
import { useCompletenessScore } from '../hooks/useCompletenessScore';
import { useFieldEditor } from '../hooks/useFieldEditor';
import { useAdminConfig } from '../hooks/useAdminConfig';
import { ProgressBar } from './ProgressBar';
import { RefreshButton } from './RefreshButton';
import { EditableFieldRow } from './EditableFieldRow';
import { ConfigModal } from './ConfigModal';
import { ModificationHistory } from './ModificationHistory';
import { FIELD_CONFIG } from '../domain/constants';

// Max modifications tracked in session (E15)
const MAX_HISTORY_ENTRIES = 3;

/**
 * DataQualityCard — Root polymorphic component.
 *
 * V2 layout (vertical, spec):
 *   Title [gear icon for admin] → ProgressBar (X/N fields) → EditableFieldRows
 *   → ModificationHistory → CTA → RefreshButton
 *
 * States:
 *   - loading          : Properties not yet available
 *   - error_type       : Unknown objectType
 *   - error_props      : Properties null or empty
 *   - complete         : score === 100 — "Fiche complète"
 *   - incomplete       : 0 <= score < 100 — editable rows + CTA
 *
 * @param {object} context    - HubSpot SDK context (crm.objectType, crm.objectId, user.roleType)
 * @param {object} actions    - HubSpot SDK actions (refreshObjectProperties)
 * @param {object} properties - CRM properties map from SDK
 * @param {Function} runServerlessFunction - HubSpot SDK for calling serverless functions
 */
export function DataQualityCard({ context, actions, properties, error, runServerlessFunction }) {
  const objectType = context?.crm?.objectType;
  const objectId = context?.crm?.objectId;
  const isAdmin = context?.user?.roleType === 'ADMIN';

  // V2: Admin config state
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // V2: Modification history (max 3 entries, session memory)
  const [modificationHistory, setModificationHistory] = useState([]);

  // V2: Admin config hook
  const { config: adminConfig, isSaving: isSavingConfig, error: configError, saveConfig, resetConfig } =
    useAdminConfig();

  const configuredFields = adminConfig
    ? (objectType === 'contacts' ? adminConfig.contacts : adminConfig.companies)
    : null;

  // Rules of Hooks: useCompletenessScore must be called unconditionally.
  // Pass null objectType/properties when in error state — hook handles it gracefully.
  const isValidType = objectType === 'contacts' || objectType === 'companies';
  const { score, color, missingFields, isComplete, totalFields } = useCompletenessScore(
    isValidType ? objectType : 'contacts',
    properties || {},
    configuredFields
  );

  const handleRefresh = () => {
    actions?.refreshObjectProperties?.();
  };

  // V2: Callback when a field is saved successfully
  const handleFieldSaved = useCallback((fieldName) => {
    setModificationHistory((prev) => {
      const newEntry = { fieldName, timestamp: Date.now(), objectType };
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES);
      return updated;
    });
  }, [objectType]);

  // Error state: properties not loaded
  if (!properties) {
    return (
      <Flex direction="column" gap="small">
        <Text format={{ fontWeight: 'demibold' }}>Data Quality Score</Text>
        <Divider />
        <Alert variant="warning">
          {error || 'Données non disponibles. Impossible de charger les propriétés CRM.'}
        </Alert>
        <RefreshButton onRefresh={handleRefresh} />
      </Flex>
    );
  }

  // Error state: unknown object type
  if (!isValidType) {
    return (
      <Flex direction="column" gap="small">
        <Text format={{ fontWeight: 'demibold' }}>Data Quality Score</Text>
        <Divider />
        <Alert variant="warning">
          Type d'objet non supporté. Seuls contacts et companies sont pris en charge.
        </Alert>
        <RefreshButton onRefresh={handleRefresh} />
      </Flex>
    );
  }

  const objectLabel = objectType === 'contacts' ? 'Contact' : 'Company';

  // All tracked fields (configured or default) for EditableFieldRow display
  const trackedFields = configuredFields || FIELD_CONFIG[objectType] || [];

  return (
    <Flex direction="column" gap="small">
      {/* Header with optional admin gear button */}
      <Flex direction="row" justify="between" align="center">
        <Text format={{ fontWeight: 'demibold' }}>
          Data Quality Score — {objectLabel}
        </Text>
        {/* V2: Admin config button — visible only for ADMIN role */}
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

      {/* Score progress bar with X/N display */}
      <ProgressBar score={score} color={color} totalFields={totalFields} />

      {/* V2: All tracked fields with inline editing */}
      {isComplete ? (
        <Flex direction="column" gap="extra-small">
          <Text format={{ fontWeight: 'demibold' }}>✓ Fiche complète</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="extra-small">
          {trackedFields.map((fieldName) => {
            // Each field gets its own editor instance
            return (
              <FieldEditorWrapper
                key={fieldName}
                fieldName={fieldName}
                properties={properties}
                objectType={objectType}
                objectId={objectId}
                color={color}
                missingFields={missingFields}
                onSaveSuccess={handleFieldSaved}
                runServerlessFunction={runServerlessFunction}
              />
            );
          })}
        </Flex>
      )}

      {/* V2: Modification history (max 3 entries) */}
      <ModificationHistory history={modificationHistory} />

      <Divider />

      {/* CTA: open record editor — always shown alongside inline editing (D6) */}
      {!isComplete && (
        <CrmActionButton
          actionType="OPEN_RECORD"
          actionContext={{
            objectTypeId: objectType,
            objectId: objectId,
          }}
        >
          Compléter les champs
        </CrmActionButton>
      )}

      {/* Refresh button — always visible */}
      <RefreshButton onRefresh={handleRefresh} />

      {/* V2: Admin config modal */}
      {isAdmin && (
        <ConfigModal
          open={configModalOpen}
          config={adminConfig}
          isSaving={isSavingConfig}
          error={configError}
          onSave={saveConfig}
          onReset={resetConfig}
          onClose={() => setConfigModalOpen(false)}
          objectType={objectType}
        />
      )}
    </Flex>
  );
}

/**
 * FieldEditorWrapper — Renders one EditableFieldRow with its own useFieldEditor instance.
 * This pattern allows each field to have independent editing state.
 */
function FieldEditorWrapper({
  fieldName,
  properties,
  objectType,
  objectId,
  color,
  missingFields,
  onSaveSuccess,
  runServerlessFunction,
}) {
  const initialValue = properties[fieldName] ?? null;

  // Detect field type from property name conventions
  const fieldType = detectFieldType(fieldName);

  // V2: saveFn wraps the HubSpot SDK CRM update call
  const saveFn = runServerlessFunction
    ? async (objType, objId, fname, value) => {
        // Pattern: hubspot.crm.[contacts|companies].update via SDK
        // In real deployment, this uses the HubSpot SDK CRM write methods.
        // For now we use runServerlessFunction as the injection point.
        await runServerlessFunction(`crm.${objType}.update`, {
          objectId: objId,
          properties: { [fname]: value },
        });
      }
    : undefined;

  const {
    currentValue,
    isEditing,
    status,
    errorMessage,
    startEditing,
    cancelEditing,
    updateValue,
    saveField,
  } = useFieldEditor({
    fieldName,
    initialValue,
    fieldType,
    objectType,
    objectId,
    onSaveSuccess,
    saveFn,
  });

  return (
    <EditableFieldRow
      fieldName={fieldName}
      currentValue={isEditing ? currentValue : (properties[fieldName] ?? null)}
      fieldType={fieldType}
      isEditing={isEditing}
      status={status}
      errorMessage={errorMessage}
      scoreColor={missingFields.includes(fieldName) ? color : 'green'}
      onStartEditing={startEditing}
      onCancelEditing={cancelEditing}
      onUpdateValue={updateValue}
      onSave={saveField}
    />
  );
}

/**
 * Detects the field type for HubSpot standard fields.
 * Returns 'text' for unknown fields.
 */
function detectFieldType(fieldName) {
  const typeMap = {
    lifecyclestage: 'select',
    industry: 'select',
    country: 'select',
    hubspot_owner_id: 'owner',
  };
  return typeMap[fieldName] || 'text';
}
