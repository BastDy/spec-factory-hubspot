// V2: ConfigModal — Admin configuration panel for required fields
// Visible only when context.user.roleType === "ADMIN"
// Allows admins to configure which fields are required for contacts and companies.

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Text,
  Flex,
  Divider,
  Checkbox,
  LoadingSpinner,
} from '@hubspot/ui-extensions';
import { FIELD_CONFIG, FIELD_DISPLAY_NAMES } from '../domain/constants';

// Fallback field list when Properties API is unavailable
const DEFAULT_CONTACT_PROPERTIES = FIELD_CONFIG.contacts.map((name) => ({
  name,
  label: FIELD_DISPLAY_NAMES[name] || name,
}));

const DEFAULT_COMPANY_PROPERTIES = FIELD_CONFIG.companies.map((name) => ({
  name,
  label: FIELD_DISPLAY_NAMES[name] || name,
}));

/**
 * ConfigModal — Admin modal for configuring required fields.
 *
 * Rules:
 * - Visible only to ADMIN users
 * - Config applies to all portal users
 * - Min 1 field required (E11) — save blocked if 0 fields selected
 * - Warning shown when N changes (impacts existing scores)
 * - "Reset" restores V1 default 6 fields
 *
 * @param {boolean} open - Whether the modal is open
 * @param {object} config - Current admin config { contacts: string[], companies: string[] }
 * @param {boolean} isSaving - Whether save is in progress
 * @param {string|null} error - Error message from saveConfig/resetConfig
 * @param {Function} onSave - Called with { contacts: string[], companies: string[] }
 * @param {Function} onReset - Called to reset to V1 defaults
 * @param {Function} onClose - Called to close the modal
 * @param {string} objectType - Current CRM object type ('contacts' | 'companies')
 */
export function ConfigModal({
  open,
  config,
  isSaving,
  error,
  onSave,
  onReset,
  onClose,
  objectType,
}) {
  const isContacts = objectType === 'contacts';

  // Local state for draft selections (uncommitted changes)
  const [contactsSelection, setContactsSelection] = useState(
    config?.contacts || FIELD_CONFIG.contacts
  );
  const [companiesSelection, setCompaniesSelection] = useState(
    config?.companies || FIELD_CONFIG.companies
  );
  const [validationError, setValidationError] = useState(null);

  // Sync draft with incoming config when modal opens
  useEffect(() => {
    if (open) {
      setContactsSelection(config?.contacts || FIELD_CONFIG.contacts);
      setCompaniesSelection(config?.companies || FIELD_CONFIG.companies);
      setValidationError(null);
    }
  }, [open, config]);

  const currentSelection = isContacts ? contactsSelection : companiesSelection;
  const defaultN = isContacts ? FIELD_CONFIG.contacts.length : FIELD_CONFIG.companies.length;
  const availableProperties = isContacts ? DEFAULT_CONTACT_PROPERTIES : DEFAULT_COMPANY_PROPERTIES;

  const handleSave = () => {
    // E11: At least 1 field required
    if (contactsSelection.length === 0) {
      setValidationError('Au moins 1 champ requis pour les contacts');
      return;
    }
    if (companiesSelection.length === 0) {
      setValidationError('Au moins 1 champ requis pour les companies');
      return;
    }

    setValidationError(null);
    onSave({ contacts: contactsSelection, companies: companiesSelection });
  };

  const handleReset = () => {
    setContactsSelection([...FIELD_CONFIG.contacts]);
    setCompaniesSelection([...FIELD_CONFIG.companies]);
    setValidationError(null);
    onReset();
  };

  const handleToggleField = (fieldName, checked) => {
    const updater = (prev) =>
      checked ? [...prev, fieldName] : prev.filter((f) => f !== fieldName);
    if (isContacts) {
      setContactsSelection(updater);
    } else {
      setCompaniesSelection(updater);
    }
    setValidationError(null);
  };

  const nChanged = currentSelection.length !== defaultN;

  if (!open) return null;

  return (
    <Modal id="admin-config-modal" open={open} onClose={onClose}>
      <ModalBody>
        <Flex direction="column" gap="medium">
          <Text format={{ fontWeight: 'demibold' }}>Configuration des champs obligatoires</Text>

          <Alert variant="info">
            Cette configuration s'applique à tous les utilisateurs du portail.
          </Alert>

          {nChanged && (
            <Alert variant="warning">
              Modifier le nombre de champs impactera les scores existants sur toutes les fiches.
            </Alert>
          )}

          <Text format={{ fontWeight: 'demibold' }}>
            Champs {isContacts ? 'contacts' : 'companies'} obligatoires
          </Text>

          <Text>
            Score calculé sur {currentSelection.length} champ{currentSelection.length > 1 ? 's' : ''}
          </Text>

          {isSaving ? (
            <LoadingSpinner label="Sauvegarde en cours..." />
          ) : (
            <Flex direction="column" gap="extra-small">
              {availableProperties.map((prop) => (
                <Checkbox
                  key={prop.name}
                  name={prop.name}
                  label={prop.label}
                  checked={currentSelection.includes(prop.name)}
                  onChange={(checked) => handleToggleField(prop.name, checked)}
                />
              ))}
            </Flex>
          )}

          {(validationError || error) && (
            <Alert variant="error">
              {validationError || error}
            </Alert>
          )}

          <Divider />
        </Flex>
      </ModalBody>

      <ModalFooter>
        <Flex direction="row" gap="small" justify="between">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isSaving}
            aria-label="Réinitialiser vers les 6 champs par défaut"
          >
            Réinitialiser
          </Button>
          <Flex direction="row" gap="small">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Annuler la configuration"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Sauvegarder la configuration"
            >
              Sauvegarder
            </Button>
          </Flex>
        </Flex>
      </ModalFooter>
    </Modal>
  );
}
