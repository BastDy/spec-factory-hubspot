import { hubspot, Text, Flex, Divider, Button, Alert, ProgressBar } from '@hubspot/ui-extensions';
import { CrmPropertyList, useCrmProperties } from '@hubspot/ui-extensions/crm';
import { isFieldEmpty } from './domain/scoring';

const CONTACT_FIELDS = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'company',
  'jobtitle',
  'lifecyclestage',
  'hubspot_owner_id'
];

function useCompletenessScore(properties) {
  const filled = CONTACT_FIELDS.filter((field) => !isFieldEmpty(properties[field])).length;
  const total = CONTACT_FIELDS.length;
  const percent = Math.round((filled / total) * 100);

  let emoji;
  if (percent < 50) {
    emoji = '🔴';
  } else if (percent <= 80) {
    emoji = '🟡';
  } else {
    emoji = '🟢';
  }

  return { filled, total, percent, emoji };
}

function Extension({ actions }) {
  const { properties } = useCrmProperties(CONTACT_FIELDS);
  const score = useCompletenessScore(properties || {});

  function handleRefresh() {
    actions.refreshObjectProperties();
  }

  return (
    <Flex direction="column">
      <ProgressBar value={score.percent} />
      <Text>{score.emoji} {score.filled}/{score.total}</Text>
      <Divider />
      <CrmPropertyList
        properties={CONTACT_FIELDS}
        direction="row"
        objectTypeId="0-1"
      />
      <Button onClick={handleRefresh}>Rafraîchir</Button>
    </Flex>
  );
}

hubspot.extend(({ actions }) => (
  <Extension actions={actions} />
));
