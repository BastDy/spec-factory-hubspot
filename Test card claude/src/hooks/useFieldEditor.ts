// Application layer — useFieldEditor hook (V2)
// Manages the lifecycle of inline field editing.
// No UI imports — purely stateful logic. SDK calls are injected via options.

import { useState, useCallback } from 'react';
import type { FieldType, EditStatus } from '../domain/types';

export interface UseFieldEditorOptions {
  fieldName: string;
  initialValue: string | null;
  fieldType: FieldType;
  objectType: 'contacts' | 'companies';
  objectId: string;
  /** Called after a successful save — used to recalculate score and update history */
  onSaveSuccess?: (fieldName: string, newValue: string) => void;
  /**
   * Injectable save function for testability.
   * In production, this wraps hubspot.crm.[contacts|companies].update().
   * If not provided, a no-op is used (caller must override for real usage).
   */
  saveFn?: (objectType: string, objectId: string, fieldName: string, value: string) => Promise<void>;
}

export interface UseFieldEditorResult {
  currentValue: string | null;
  isEditing: boolean;
  status: EditStatus;
  errorMessage: string | null;
  startEditing: () => void;
  cancelEditing: () => void;
  updateValue: (newValue: string) => void;
  saveField: () => Promise<void>;
}

/**
 * Hook managing the inline editing cycle for a single CRM field.
 *
 * Rules:
 * - status === 'saving' → subsequent saveField() calls are ignored (E10)
 * - cancelEditing() → currentValue reverts to initialValue, isEditing = false
 * - saveField() → calls saveFn, sets status = 'saving', then 'success' or 'error'
 * - On error → errorMessage set, mode editing maintained
 * - On success → isEditing = false, onSaveSuccess called
 *
 * @param options - Field configuration and callbacks
 * @returns State and actions for inline field editing
 *
 * @example
 * const { isEditing, startEditing, saveField } = useFieldEditor({
 *   fieldName: 'phone',
 *   initialValue: '',
 *   fieldType: 'text',
 *   objectType: 'contacts',
 *   objectId: '12345',
 * });
 */
export function useFieldEditor(options: UseFieldEditorOptions): UseFieldEditorResult {
  const { fieldName, initialValue, objectType, objectId, onSaveSuccess, saveFn } = options;

  const [currentValue, setCurrentValue] = useState<string | null>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<EditStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setCurrentValue(initialValue);
    setIsEditing(false);
    setStatus('idle');
    setErrorMessage(null);
  }, [initialValue]);

  const updateValue = useCallback((newValue: string) => {
    setCurrentValue(newValue);
  }, []);

  const saveField = useCallback(async () => {
    // E10: Ignore save call if already saving (debounce guard)
    if (status === 'saving') return;

    const valueToSave = currentValue ?? '';

    setStatus('saving');
    setErrorMessage(null);

    try {
      if (saveFn) {
        await saveFn(objectType, objectId, fieldName, valueToSave);
      }
      // No saveFn provided: assume success (caller is responsible for wiring SDK)
      setStatus('success');
      setIsEditing(false);
      onSaveSuccess?.(fieldName, valueToSave);
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setErrorMessage(message);
      // Maintain editing mode on error so user can retry
    }
  }, [status, currentValue, objectType, objectId, fieldName, saveFn, onSaveSuccess]);

  return {
    currentValue,
    isEditing,
    status,
    errorMessage,
    startEditing,
    cancelEditing,
    updateValue,
    saveField,
  };
}
