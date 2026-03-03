// V2: Entry point for the Data Quality Score HubSpot UI Extension

import { hubspot, Text } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';
import { useState, useEffect } from 'react';

// Propriétés par défaut à charger selon le type d'objet.
// L'admin peut modifier les champs affichés/scorés via le panneau de configuration.
// Doit couvrir toutes les propriétés potentiellement configurables par l'admin.
const PROPERTIES_BY_TYPE = {
  contacts: [
    'firstname', 'lastname', 'email', 'phone', 'company',
    'jobtitle', 'lifecyclestage', 'hubspot_owner_id',
    'mobilephone', 'website', 'address', 'city', 'state',
    'zip', 'country', 'hs_lead_status',
  ],
  companies: [
    'name', 'domain', 'phone', 'city', 'country',
    'industry', 'numberofemployees', 'hubspot_owner_id',
    'website', 'address', 'state', 'zip', 'description',
    'annualrevenue', 'linkedin_company_page', 'twitterhandle',
  ],
  '0-1': [
    'firstname', 'lastname', 'email', 'phone', 'company',
    'jobtitle', 'lifecyclestage', 'hubspot_owner_id',
    'mobilephone', 'website', 'address', 'city', 'state',
    'zip', 'country', 'hs_lead_status',
  ],
  '0-2': [
    'name', 'domain', 'phone', 'city', 'country',
    'industry', 'numberofemployees', 'hubspot_owner_id',
    'website', 'address', 'state', 'zip', 'description',
    'annualrevenue', 'linkedin_company_page', 'twitterhandle',
  ],
};

function DataQualityCardEntry({ context, actions }) {
  const [properties, setProperties] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const objectType = context?.crm?.objectType;

  useEffect(() => {
    if (!objectType || !actions?.fetchCrmObjectProperties) return;

    const propNames = PROPERTIES_BY_TYPE[objectType] || PROPERTIES_BY_TYPE.contacts;

    actions.fetchCrmObjectProperties(propNames)
      .then((data) => setProperties(data))
      .catch(() => {
        setFetchError('Impossible de charger les données CRM.');
        setProperties({});
      });
  }, [objectType]);

  if (!properties && !fetchError) {
    return <Text>Chargement des données...</Text>;
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
