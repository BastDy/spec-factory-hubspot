import { Text, Flex } from '@hubspot/ui-extensions';
import { FIELD_DISPLAY_NAMES } from '../domain/constants';

export function EditableFieldRow({ fieldName, currentValue }) {
  const label = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
  const isEmpty = !currentValue;

  return (
    <Flex direction="row" justify="between" align="center" gap="small">
      <Text format={{ fontWeight: 'demibold' }}>{label}</Text>
      <Text>
        {isEmpty ? '🔴 (vide)' : `🟢 ${currentValue}`}
      </Text>
    </Flex>
  );
}
