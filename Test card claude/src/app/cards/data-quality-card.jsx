import { hubspot, Text, Flex, Divider, Button, Alert, ProgressBar } from '@hubspot/ui-extensions';
import { CrmPropertyList } from '@hubspot/ui-extensions/crm';
import { useCrmProperties } from '@hubspot/ui-extensions/crm';

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
  const filled = CONTACT_FIELDS.filter(
    (field) => properties[field] !== null && properties[field] !== undefined && properties[field] !== ''
  ).length;
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
  const { properties, isLoading } = useCrmProperties(CONTACT_FIELDS);
  const score = useCompletenessScore(properties || {});

  function handleRefresh() {
    actions.refreshObjectProperties();
  }

  return (
    <Flex direction="column">
      <ProgressBar value={score.percent} />
      <Text>{score.emoji} {score.filled}/{score.total}</Text>
      <Divider />
      {CONTACT_FIELDS.length === 0 && (
        <Alert title="Propriété non supportée" type="error">
          Aucune propriété disponible à afficher.
        </Alert>
      )}
      <CrmPropertyList
        properties={CONTACT_FIELDS}
        direction="row"
        objectTypeId="0-1"
      />
      <Button onClick={handleRefresh}>Rafraîchir</Button>
    </Flex>
  );
}

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));
