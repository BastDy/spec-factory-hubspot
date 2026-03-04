import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// -----------------------------------------------------------------------
// Test strategy:
// data-quality-card.jsx calls hubspot.extend(callback) at module level.
// The mock captures that callback. We then invoke it with mock context/actions
// to render the Extension component directly.
// -----------------------------------------------------------------------

// Capture the extend callback
let capturedCallback = null;
jest.mock('@hubspot/ui-extensions', () => {
  const React = require('react');
  return {
    hubspot: {
      extend: jest.fn((cb) => { capturedCallback = cb; })
    },
    Text: ({ children }) => React.createElement('span', { 'data-testid': 'hs-text' }, children),
    Button: ({ children, onClick }) => React.createElement('button', { 'data-testid': 'hs-button', onClick }, children),
    Flex: ({ children, direction }) => React.createElement('div', { 'data-testid': 'hs-flex', 'data-direction': direction }, children),
    Divider: () => React.createElement('hr', { 'data-testid': 'hs-divider' }),
    Alert: ({ children, title, type }) => React.createElement('div', { 'data-testid': 'hs-alert', 'data-type': type, 'data-title': title }, children || title),
    ProgressBar: ({ value }) => React.createElement('div', { 'data-testid': 'hs-progress-bar', 'data-value': String(value) })
  };
});

jest.mock('@hubspot/ui-extensions/crm', () => {
  const React = require('react');
  return {
    CrmPropertyList: ({ properties, direction, objectTypeId }) =>
      React.createElement('div', {
        'data-testid': 'hs-crm-property-list',
        'data-direction': direction,
        'data-object-type-id': objectTypeId,
        'data-properties': JSON.stringify(properties)
      })
  };
});

// Load the module — this triggers hubspot.extend(callback) and sets capturedCallback
require('../app/cards/data-quality-card.jsx');

// Helper: build mock context
function buildContext(properties = {}) {
  return {
    crm: {
      objectTypeId: '0-1',
      objectId: '12345',
      properties
    }
  };
}

// Helper: render the Extension with given properties
function renderExtension(properties = {}) {
  const mockActions = { refreshObjectProperties: jest.fn() };
  const context = buildContext(properties);
  const element = capturedCallback({ context, actions: mockActions });
  const result = render(element);
  return { ...result, mockActions };
}

afterEach(() => {
  // Clean up rendered components between tests
});

// -----------------------------------------------------------------------
// useCompletenessScore tests
// -----------------------------------------------------------------------
describe('useCompletenessScore — hook pur', () => {
  test('score 0/8 avec propriétés vides — emoji 🔴, percent=0', () => {
    const { getByTestId } = renderExtension({});
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '0');
    expect(getByTestId('hs-text')).toHaveTextContent('🔴 0/8');
  });

  test('score 8/8 avec toutes les propriétés — emoji 🟢, percent=100', () => {
    const { getByTestId } = renderExtension({
      firstname: 'A',
      lastname: 'B',
      email: 'user@example.com',
      phone: '1',
      company: 'X',
      jobtitle: 'Y',
      lifecyclestage: 'Z',
      hubspot_owner_id: '1'
    });
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '100');
    expect(getByTestId('hs-text')).toHaveTextContent('🟢 8/8');
  });

  test('score 4/8 avec la moitié des propriétés — emoji 🟡, percent=50 (critère T3)', () => {
    const { getByTestId } = renderExtension({
      firstname: 'A',
      lastname: 'B',
      email: 'user@example.com',
      phone: '1'
    });
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '50');
    expect(getByTestId('hs-text')).toHaveTextContent('🟡 4/8');
  });

  test('null compte comme vide', () => {
    const { getByTestId } = renderExtension({ firstname: null });
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '0');
  });

  test('undefined compte comme vide', () => {
    const { getByTestId } = renderExtension({ firstname: undefined });
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '0');
  });

  test('chaîne vide compte comme vide', () => {
    const { getByTestId } = renderExtension({ firstname: '' });
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '0');
  });

  test('string non vide "0" compte comme renseigné', () => {
    const { getByTestId } = renderExtension({ firstname: '0' });
    // 1/8 = 12.5 → Math.round = 13
    expect(getByTestId('hs-progress-bar')).toHaveAttribute('data-value', '13');
  });

  test('percent exactement à 50 → emoji 🟡', () => {
    const { getByTestId } = renderExtension({
      firstname: 'A', lastname: 'B', email: 'user@example.com', phone: '1'
    });
    expect(getByTestId('hs-text')).toHaveTextContent('🟡');
  });

  test('percent exactement à 80 (7/8 ≈ 88 → 🟢, 6/8=75 → 🟡)', () => {
    // 6/8 = 75% → 🟡
    const { getByTestId } = renderExtension({
      firstname: 'A', lastname: 'B', email: 'c@example.com',
      phone: '1', company: 'X', jobtitle: 'Y'
    });
    expect(getByTestId('hs-text')).toHaveTextContent('🟡');
  });
});

// -----------------------------------------------------------------------
// Extension — rendu initial
// -----------------------------------------------------------------------
describe('Extension — rendu initial', () => {
  test('ProgressBar présente', () => {
    const { getByTestId } = renderExtension();
    expect(getByTestId('hs-progress-bar')).toBeInTheDocument();
  });

  test('CrmPropertyList présente avec direction="row" (critère T1)', () => {
    const { getByTestId } = renderExtension();
    const list = getByTestId('hs-crm-property-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('data-direction', 'row');
  });

  test('CrmPropertyList a objectTypeId="0-1" (critère Q2)', () => {
    const { getByTestId } = renderExtension();
    expect(getByTestId('hs-crm-property-list')).toHaveAttribute('data-object-type-id', '0-1');
  });

  test('CrmPropertyList reçoit les 8 propriétés CONTACT_FIELDS (critère T2)', () => {
    const { getByTestId } = renderExtension();
    const list = getByTestId('hs-crm-property-list');
    const properties = JSON.parse(list.getAttribute('data-properties'));
    expect(properties).toHaveLength(8);
    expect(properties).toContain('firstname');
    expect(properties).toContain('lastname');
    expect(properties).toContain('email');
    expect(properties).toContain('phone');
    expect(properties).toContain('company');
    expect(properties).toContain('jobtitle');
    expect(properties).toContain('lifecyclestage');
    expect(properties).toContain('hubspot_owner_id');
  });

  test('Button Rafraîchir présent', () => {
    const { getByText } = renderExtension();
    expect(getByText('Rafraîchir')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// Extension — actions
// -----------------------------------------------------------------------
describe('Extension — actions', () => {
  test('clic Rafraîchir appelle refreshObjectProperties (critère A3)', () => {
    const { getByText, mockActions } = renderExtension();
    fireEvent.click(getByText('Rafraîchir'));
    expect(mockActions.refreshObjectProperties).toHaveBeenCalledTimes(1);
  });
});

// -----------------------------------------------------------------------
// Extension — gestion erreurs
// -----------------------------------------------------------------------
describe('Extension — gestion erreurs (critère A4)', () => {
  test('Alert non affichée si CONTACT_FIELDS est non vide (cas nominal)', () => {
    const { queryByTestId } = renderExtension();
    // Alert affiché seulement si CONTACT_FIELDS.length === 0 (statiquement faux)
    expect(queryByTestId('hs-alert')).not.toBeInTheDocument();
  });
});
