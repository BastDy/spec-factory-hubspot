const React = require('react');

const CrmPropertyList = ({ properties, direction, objectTypeId }) =>
  React.createElement('div', {
    'data-testid': 'hs-crm-property-list',
    'data-direction': direction,
    'data-object-type-id': objectTypeId,
    'data-properties': JSON.stringify(properties)
  });

module.exports = {
  CrmPropertyList
};
