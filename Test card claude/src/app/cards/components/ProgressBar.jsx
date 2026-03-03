import { Text, Flex } from '@hubspot/ui-extensions';

export function ProgressBar({ score, color, totalFields }) {
  const filledCount = totalFields ? Math.round((score / 100) * totalFields) : null;
  const emoji = score === 100 ? '🟢' : score >= 50 ? '🟡' : '🔴';

  return (
    <Flex direction="column" gap="extra-small">
      <Text format={{ fontWeight: 'demibold' }}>Score de complétude</Text>
      <Text>{emoji} {score}% {filledCount != null ? `— ${filledCount}/${totalFields} champs` : ''}</Text>
    </Flex>
  );
}
