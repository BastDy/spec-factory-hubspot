import { hubspot, Text } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';
import { useState, useEffect } from 'react';

const PROPERTIES_BY_TYPE = {
  '0-1': ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'],
  '0-2': ['name', 'domain', 'phone', 'country', 'industry'],
};

function DataQualityCardEntry({ context, actions }) {
  const objectTypeId = context?.crm?.objectTypeId;
  const fields = PROPERTIES_BY_TYPE[objectTypeId] || [];
  const [properties, setProperties] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!objectTypeId || !fields.length) return;
    actions.fetchCrmObjectProperties(fields)
      .then((data) => setProperties(data))
      .catch(() => {
        setFetchError('Impossible de charger les données CRM.');
        setProperties({});
      });
  }, [objectTypeId]);

  if (properties === null && !fetchError) {
    return <Text>Chargement...</Text>;
  }

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={properties || {}}
      error={fetchError}
      settingsApi={actions?.settingsApi}
    />
  );
}

hubspot.extend((props) => (
  <DataQualityCardEntry
    context={props.context}
    actions={props.actions}
  />
));
