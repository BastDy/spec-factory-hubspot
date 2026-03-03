import React from 'react';
import { Button } from '@hubspot/ui-extensions';

/**
 * RefreshButton — Always-visible button that forces reload of CRM properties.
 *
 * Calls actions.refreshObjectProperties() on click.
 * Visible in all states including score=100% and error states.
 *
 * @param {Function} onRefresh - Callback calling actions.refreshObjectProperties()
 */
export function RefreshButton({ onRefresh }) {
  return (
    <Button
      variant="secondary"
      onClick={onRefresh}
      aria-label="Rafraîchir les propriétés CRM"
    >
      Rafraîchir
    </Button>
  );
}
