// V2: Entry point for the Data Quality Score HubSpot UI Extension
// Registers the DataQualityCard component with the HubSpot SDK.

import { hubspot } from '@hubspot/ui-extensions';
import { DataQualityCard } from '@data-quality-helper/components';

// hubspot.extend() registers the card component with the HubSpot CRM sidebar.
// The SDK injects: context, actions, properties, runServerlessFunction.
hubspot.extend((props) => (
  <DataQualityCard
    context={props.context}
    actions={props.actions}
    properties={props.properties}
    runServerlessFunction={props.runServerlessFunction}
  />
));
