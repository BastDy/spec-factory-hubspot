import { hubspot, Text } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';
import { useState, useEffect } from 'react';

const CONTACT_FIELDS = ['firstname', 'lastname', 'email', 'phone', 'lifecyclestage'];

function Extension({ context, actions }) {
  const [props, setProps] = useState(null);

  useEffect(() => {
    actions.fetchCrmObjectProperties(CONTACT_FIELDS).then(setProps);
  }, []);

  if (!props) return <Text>Chargement...</Text>;

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={props}
      error={null}
      settingsApi={null}
    />
  );
}

hubspot.extend(({ context, actions }) => (
  <Extension context={context} actions={actions} />
));
