// V2: Entry point for the Data Quality Score HubSpot UI Extension
// Platform 2025.2: properties fetched via useCrmProperties hook (not propertiesRequested in hsmeta)

import { hubspot } from '@hubspot/ui-extensions';
import { useCrmProperties } from '@hubspot/ui-extensions/crm';
import { DataQualityCard } from '@data-quality-helper/components';

// All CRM properties needed across contacts and companies
const ALL_PROPERTIES = [
  // Contacts
  'firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle', 'lifecyclestage',
  // Companies
  'name', 'domain', 'city', 'country', 'industry', 'numberofemployees',
  // Both
  'hubspot_owner_id',
];

function DataQualityCardEntry({ context, actions }) {
  const { properties, isLoading, error } = useCrmProperties(ALL_PROPERTIES);

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={isLoading ? null : (properties || {})}
      error={error ? 'Impossible de charger les données CRM.' : null}
    />
  );
}

hubspot.extend((props) => (
  <DataQualityCardEntry
    context={props.context}
    actions={props.actions}
  />
));
