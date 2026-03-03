// Unit tests for hooks/useCompletenessScore.ts
// Tests the hook via renderHook — no HubSpot SDK involved

import { renderHook } from '@testing-library/react';
import { useCompletenessScore } from '../app/cards/hooks/useCompletenessScore';

describe('useCompletenessScore', () => {
  describe('contacts (V1 — default 6 fields)', () => {
    it('returns score=100 and isComplete=true when all contact fields are filled', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props));
      expect(result.current.score).toBe(100);
      expect(result.current.color).toBe('green');
      expect(result.current.missingFields).toHaveLength(0);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.totalFields).toBe(6);
    });

    it('returns score=0 and color=red when all contact fields are empty', () => {
      const { result } = renderHook(() => useCompletenessScore('contacts', {}));
      expect(result.current.score).toBe(0);
      expect(result.current.color).toBe('red');
      expect(result.current.missingFields).toHaveLength(6);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.totalFields).toBe(6);
    });

    it('returns score=67 (orange) for 4/6 filled contact fields', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: null,
        hubspot_owner_id: null,
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props));
      expect(result.current.score).toBe(67);
      expect(result.current.color).toBe('orange');
      expect(result.current.missingFields).toContain('lifecyclestage');
      expect(result.current.missingFields).toContain('hubspot_owner_id');
    });

    it('returns score=83 (green) for 5/6 filled contact fields', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: null,
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props));
      expect(result.current.score).toBe(83);
      expect(result.current.color).toBe('green');
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('companies (V1 — default 6 fields)', () => {
    it('returns score=100 and isComplete=true when all company fields are filled', () => {
      const props = {
        name: 'Acme Corp',
        domain: 'acme.com',
        industry: 'TECHNOLOGY',
        phone: '+33123456789',
        country: 'France',
        hubspot_owner_id: '99999',
      };
      const { result } = renderHook(() => useCompletenessScore('companies', props));
      expect(result.current.score).toBe(100);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.totalFields).toBe(6);
    });

    it('returns score=0 and color=red when all company fields are empty', () => {
      const { result } = renderHook(() => useCompletenessScore('companies', {}));
      expect(result.current.score).toBe(0);
      expect(result.current.color).toBe('red');
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('unknown objectType (error state)', () => {
    it('returns safe error state for unknown type', () => {
      const { result } = renderHook(() =>
        useCompletenessScore('deals', { amount: '1000' })
      );
      expect(result.current.score).toBe(0);
      expect(result.current.color).toBe('red');
      expect(result.current.missingFields).toHaveLength(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.totalFields).toBe(0);
    });

    it('returns safe error state for empty string type', () => {
      const { result } = renderHook(() =>
        useCompletenessScore('', {})
      );
      expect(result.current.score).toBe(0);
      expect(result.current.color).toBe('red');
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('treats hubspot_owner_id="0" as empty', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '0',
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props));
      expect(result.current.missingFields).toContain('hubspot_owner_id');
      expect(result.current.score).toBe(83);
    });

    it('treats whitespace-only value as empty', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: '   ',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props));
      expect(result.current.missingFields).toContain('email');
    });
  });

  // V2: configuredFields (dynamic N)
  describe('V2: configuredFields parameter (dynamic N)', () => {
    it('uses configuredFields when provided — N = configuredFields.length', () => {
      const customFields = ['firstname', 'email', 'phone', 'lifecyclestage', 'hubspot_owner_id', 'jobtitle', 'city', 'country'];
      const props = {
        firstname: 'Jean',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
        jobtitle: null,
        city: null,
        country: null,
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props, customFields));
      expect(result.current.totalFields).toBe(8);
      expect(result.current.score).toBe(63); // 5/8 = 62.5 → rounded to 63
      expect(result.current.missingFields).toContain('jobtitle');
      expect(result.current.missingFields).toContain('city');
      expect(result.current.missingFields).toContain('country');
    });

    it('falls back to V1 6 fields when configuredFields is null', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props, null));
      expect(result.current.totalFields).toBe(6);
      expect(result.current.score).toBe(100);
    });

    it('falls back to V1 6 fields when configuredFields is empty array', () => {
      const props = { firstname: 'Jean' };
      const { result } = renderHook(() => useCompletenessScore('contacts', props, []));
      expect(result.current.totalFields).toBe(6);
    });

    it('correctly calculates 75% for 3/4 custom fields', () => {
      const customFields = ['firstname', 'email', 'phone', 'jobtitle'];
      const props = {
        firstname: 'Jean',
        email: 'jean@example.com',
        phone: '+33612345678',
        jobtitle: null,
      };
      const { result } = renderHook(() => useCompletenessScore('contacts', props, customFields));
      expect(result.current.totalFields).toBe(4);
      expect(result.current.score).toBe(75);
      expect(result.current.color).toBe('orange');
      expect(result.current.missingFields).toContain('jobtitle');
    });

    it('returns isComplete=true when all custom fields filled', () => {
      const customFields = ['firstname', 'email'];
      const props = { firstname: 'Jean', email: 'jean@example.com' };
      const { result } = renderHook(() => useCompletenessScore('contacts', props, customFields));
      expect(result.current.score).toBe(100);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.totalFields).toBe(2);
    });
  });
});
