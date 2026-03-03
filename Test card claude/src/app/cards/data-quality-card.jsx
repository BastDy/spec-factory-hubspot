import { hubspot, Text, Flex, Divider } from '@hubspot/ui-extensions';
import { DataQualityCard } from './components/DataQualityCard';
import { useState, useEffect } from 'react';

const CONTACT_FIELDS = ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'];
const COMPANY_FIELDS = ['name', 'domain', 'phone', 'country', 'industry'];

function Extension({ context, actions }) {
  const [properties, setProperties] = useState(null);
  const objectTypeId = context?.crm?.objectTypeId;
  const fields = objectTypeId === '0-2' ? COMPANY_FIELDS : CONTACT_FIELDS;

  useEffect(() => {
    actions.fetchCrmObjectProperties(fields).then(setProperties);
  }, []);

  if (!properties) return <Text>Chargement...</Text>;

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={properties}
      error={null}
      settingsApi={null}
    />
  );
}

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));
