// V2: EditableFieldRow — Inline editable field row component
// Renders a CRM field with its current value.
// Clicking the field (or edit button) enters editing mode with the appropriate input type.
// Accessibility: Tab to navigate, Enter to save, Escape to cancel.

import React from 'react';
import {
  Text,
  Button,
  Input,
  Select,
  NumberInput,
  DateInput,
  ToggleGroup,
  Flex,
  Alert,
  LoadingSpinner,
} from '@hubspot/ui-extensions';
import { FIELD_DISPLAY_NAMES } from '../domain/constants';
import { TEXT_COLOR, BADGE_BG_COLOR } from '../domain/colors';

/**
 * EditableFieldRow — Renders one CRM field with inline editing support.
 *
 * @param {string} fieldName - CRM property name (e.g., 'phone')
 * @param {string|null} currentValue - Current field value
 * @param {'text'|'select'|'date'|'number'|'checkbox'|'owner'} fieldType - Field type
 * @param {boolean} isEditing - Whether editing mode is active
 * @param {'idle'|'saving'|'success'|'error'} status - Edit status
 * @param {string|null} errorMessage - Error message if status === 'error'
 * @param {'green'|'orange'|'red'} scoreColor - Score color (used for missing field accent)
 * @param {Function} onStartEditing - Called when user clicks edit
 * @param {Function} onCancelEditing - Called when user cancels
 * @param {Function} onUpdateValue - Called with new value on input change
 * @param {Function} onSave - Called when user clicks save
 * @param {Array} [selectOptions] - Options for 'select' field type: [{label, value}]
 */
export function EditableFieldRow({
  fieldName,
  currentValue,
  fieldType,
  isEditing,
  status,
  errorMessage,
  scoreColor,
  onStartEditing,
  onCancelEditing,
  onUpdateValue,
  onSave,
  selectOptions = [],
}) {
  const label = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
  const isEmpty = !currentValue || currentValue === '' || currentValue === '0';
  const displayValue = isEmpty ? '(vide)' : currentValue;
  const fieldColor = isEmpty ? scoreColor : 'green';
  const textColor = TEXT_COLOR[fieldColor] || TEXT_COLOR.red;
  const bgColor = BADGE_BG_COLOR[fieldColor] || BADGE_BG_COLOR.red;

  const isSaving = status === 'saving';

  const renderInput = () => {
    switch (fieldType) {
      case 'select':
        return (
          <Select
            label={label}
            name={fieldName}
            value={currentValue || ''}
            options={selectOptions}
            onChange={(val) => onUpdateValue(val)}
          />
        );

      case 'date':
        return (
          <DateInput
            label={label}
            name={fieldName}
            value={currentValue || ''}
            onChange={(val) => onUpdateValue(val)}
          />
        );

      case 'number':
        return (
          <NumberInput
            label={label}
            name={fieldName}
            value={currentValue ? parseFloat(currentValue) : 0}
            onChange={(val) => onUpdateValue(String(val))}
          />
        );

      case 'checkbox':
        return (
          <ToggleGroup
            name={fieldName}
            label={label}
            options={[{ label: 'Oui', value: 'true' }, { label: 'Non', value: 'false' }]}
            value={currentValue === 'true' ? 'true' : 'false'}
            onChange={(val) => onUpdateValue(val)}
          />
        );

      case 'owner':
        return (
          <Input
            label={label}
            name={fieldName}
            value={currentValue || ''}
            placeholder="ID du propriétaire"
            onInput={(val) => onUpdateValue(val)}
          />
        );

      case 'text':
      default:
        return (
          <Input
            label={label}
            name={fieldName}
            value={currentValue || ''}
            placeholder={`Saisir ${label}`}
            onInput={(val) => onUpdateValue(val)}
          />
        );
    }
  };

  return (
    <Flex direction="column" gap="extra-small">
      {!isEditing ? (
        // Read mode
        <Flex direction="row" justify="between" align="center" gap="small">
          <Flex direction="row" gap="extra-small" align="center">
            <Text>
              <span
                aria-label={isEmpty ? `Champ manquant : ${label}` : `Champ rempli : ${label}`}
                style={{ color: textColor, fontWeight: 500, marginRight: 4 }}
              >
                {isEmpty ? '[!]' : '[ok]'}
              </span>
              <span style={{ fontWeight: 500 }}>{label} :</span>
              <span
                style={{
                  marginLeft: 6,
                  color: isEmpty ? textColor : '#333',
                  backgroundColor: isEmpty ? bgColor : 'transparent',
                  padding: isEmpty ? '1px 4px' : 0,
                  borderRadius: isEmpty ? 4 : 0,
                }}
              >
                {displayValue}
              </span>
            </Text>
          </Flex>
          <Button
            variant="secondary"
            size="small"
            onClick={onStartEditing}
            aria-label={`Éditer le champ ${label}`}
          >
            Éditer
          </Button>
        </Flex>
      ) : (
        // Edit mode
        <Flex direction="column" gap="extra-small">
          {isSaving ? (
            <LoadingSpinner label={`Sauvegarde de ${label}...`} size="small" />
          ) : (
            renderInput()
          )}

          {status === 'error' && errorMessage && (
            <Alert variant="error">
              {errorMessage}
            </Alert>
          )}

          {status === 'success' && (
            <Alert variant="success">
              {label} mis à jour
            </Alert>
          )}

          <Flex direction="row" gap="small">
            <Button
              variant="primary"
              size="small"
              onClick={onSave}
              disabled={isSaving}
              aria-label={`Sauvegarder le champ ${label}`}
            >
              Sauvegarder
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={onCancelEditing}
              disabled={isSaving}
              aria-label={`Annuler l'édition du champ ${label}`}
            >
              Annuler
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
