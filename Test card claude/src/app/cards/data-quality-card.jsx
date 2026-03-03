import { hubspot, Text } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';
import { useState, useEffect } from 'react';

const PROPERTIES_BY_TYPE = {
  contacts: ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'],
  companies: ['name', 'domain', 'phone', 'country', 'industry'],
  '0-1':     ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'],
  '0-2':     ['name', 'domain', 'phone', 'country', 'industry'],
};

function DataQualityCardEntry({ context, actions }) {
  const [properties, setProperties] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const objectType = context?.crm?.objectTypeId;

  useEffect(() => {
    if (!objectType || !actions?.fetchCrmObjectProperties) return;

    const propNames = PROPERTIES_BY_TYPE[objectType] || PROPERTIES_BY_TYPE['contacts'];

    actions.fetchCrmObjectProperties(propNames)
      .then((data) => setProperties(data))
      .catch(() => {
        setFetchError('Impossible de charger les données CRM.');
        setProperties({});
      });
  }, [objectType]);

  if (!objectType) {
    return <Text>Chargement du contexte...</Text>;
  }

  if (!properties && !fetchError) {
    return <Text>Chargement des propriétés ({objectType})...</Text>;
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
