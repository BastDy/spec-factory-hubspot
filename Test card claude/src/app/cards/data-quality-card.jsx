// V2: Entry point for the Data Quality Score HubSpot UI Extension
// Platform 2025.2: propertiesRequested removed from hsmeta — properties
// fetched via hubspot.fetch() against HubSpot CRM API v3.

import React, { useState, useEffect } from 'react';
import { hubspot } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';

const PROPERTIES_BY_TYPE = {
  contacts: [
    'firstname', 'lastname', 'email', 'phone',
    'company', 'jobtitle', 'lifecyclestage', 'hubspot_owner_id',
  ],
  companies: [
    'name', 'domain', 'phone', 'city',
    'country', 'industry', 'numberofemployees', 'hubspot_owner_id',
  ],
};

function DataQualityCardEntry({ context, actions, runServerlessFunction }) {
  const objectType = context?.crm?.objectType;
  const objectId = context?.crm?.objectId;

  const [properties, setProperties] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!objectType || !objectId) return;

    const propNames = PROPERTIES_BY_TYPE[objectType] || PROPERTIES_BY_TYPE.contacts;
    const url = `https://api.hubapi.com/crm/v3/objects/${objectType}/${objectId}?properties=${propNames.join(',')}`;

    hubspot.fetch(url, { method: 'GET' })
      .then((res) => res.json())
      .then((data) => setProperties(data.properties || {}))
      .catch(() => {
        setFetchError('Impossible de charger les données CRM.');
        setProperties({});
      });
  }, [objectType, objectId]);

  return (
    <DataQualityCard
      context={context}
      actions={actions}
      properties={properties}
      error={fetchError}
      runServerlessFunction={runServerlessFunction}
    />
  );
}

hubspot.extend((props) => (
  <DataQualityCardEntry
    context={props.context}
    actions={props.actions}
    runServerlessFunction={props.runServerlessFunction}
  />
));
