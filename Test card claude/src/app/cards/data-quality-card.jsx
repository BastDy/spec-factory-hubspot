import { hubspot, Text, Flex, Divider } from '@hubspot/ui-extensions';
import { useState, useEffect } from 'react';

const CONTACT_FIELDS = ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'];

function Extension({ context, actions }) {
  const [props, setProps] = useState(null);

  useEffect(() => {
    actions.fetchCrmObjectProperties(CONTACT_FIELDS).then(setProps);
  }, []);

  if (!props) return <Text>Chargement...</Text>;

  const objectTypeId = context?.crm?.objectTypeId;
  const isAdmin = context?.user?.roleType === 'ADMIN';

  return (
    <Flex direction="column" gap="small">
      <Text format={{ fontWeight: 'demibold' }}>Data Quality Score</Text>
      <Text>objectTypeId: {objectTypeId} | isAdmin: {String(isAdmin)}</Text>
      <Divider />
      {CONTACT_FIELDS.map((f) => (
        <Text key={f}>{f}: {props[f] || '—'}</Text>
      ))}
    </Flex>
  );
}

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));
