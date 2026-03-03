// V2: Entry point for the Data Quality Score HubSpot UI Extension

import { hubspot } from '@hubspot/ui-extensions';
import { useCrmProperties } from '@hubspot/ui-extensions/crm';
import { DataQualityCard } from '@data-quality-helper/components';

// Propriétés par défaut par objectType — utilisées si aucune config admin n'est sauvegardée.
// L'admin peut modifier cette liste via le panneau de configuration (roue crantée).
export const DEFAULT_PROPERTIES = {
  contacts: [
    'firstname', 'lastname', 'email', 'phone',
    'company', 'jobtitle', 'lifecyclestage', 'hubspot_owner_id',
  ],
  companies: [
    'name', 'domain', 'phone', 'city', 'country',
    'industry', 'numberofemployees', 'hubspot_owner_id',
  ],
};

// Union complète : défauts + propriétés standard configurables par l'admin.
// useCrmProperties doit couvrir toutes les propriétés que l'admin pourrait activer.
const ALL_PROPERTIES = [
  ...DEFAULT_PROPERTIES.contacts,
  ...DEFAULT_PROPERTIES.companies,
  // Propriétés contacts supplémentaires configurables
  'mobilephone', 'website', 'address', 'city', 'state', 'zip', 'country',
  'hs_lead_status', 'num_contacted_notes', 'notes_last_contacted',
  // Propriétés companies supplémentaires configurables
  'description', 'annualrevenue', 'linkedin_company_page',
  'twitterhandle', 'founded_year', 'total_money_raised',
].filter((v, i, a) => a.indexOf(v) === i); // dédoublonnage

function DataQualityCardEntry({ context, actions, settingsApi }) {
  const { properties, isLoading, error } = useCrmProperties(ALL_PROPERTIES);

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={isLoading ? null : (properties || {})}
      isLoading={isLoading}
      error={error ? 'Impossible de charger les données CRM.' : null}
      settingsApi={settingsApi}
    />
  );
}

hubspot.extend((props) => (
  <DataQualityCardEntry
    context={props.context}
    actions={props.actions}
    settingsApi={props.extensions?.settingsApi}
  />
));
