import { Text } from '@hubspot/ui-extensions';
import { FIELD_DISPLAY_NAMES } from '../domain/constants';

export function EditableFieldRow({ fieldName, currentValue }) {
  const label = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
  const isEmpty = !currentValue;
  return (
    <Text>
      {isEmpty ? '🔴' : '🟢'} {label}: {currentValue || '(vide)'}
    </Text>
  );
}
