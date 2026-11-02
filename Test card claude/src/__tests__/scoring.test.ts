// Unit tests for domain/scoring.ts — pure functions, no SDK required

import {
  isFieldEmpty,
  computeScore,
  getScoreColor,
  getMissingFields,
  getEffectiveFieldConfig,
  validateAdminConfig,
  isAdminConfigCacheValid,
} from '../app/cards/domain/scoring';
import {
  SCORE_GREEN_THRESHOLD,
  SCORE_ORANGE_THRESHOLD,
  FIELD_CONFIG,
  ADMIN_CONFIG_CACHE_TTL_MS,
} from '../app/cards/domain/constants';

describe('isFieldEmpty', () => {
  it('returns true for null', () => {
    expect(isFieldEmpty(null)).toBe(true);
  });

  it('returns true for undefined', () => {
    expect(isFieldEmpty(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isFieldEmpty('')).toBe(true);
  });

  it('returns true for "0" (hubspot_owner_id without owner)', () => {
    expect(isFieldEmpty('0')).toBe(true);
  });

  it('returns true for whitespace-only string', () => {
    expect(isFieldEmpty('   ')).toBe(true);
  });

  it('returns false for a non-empty value', () => {
    expect(isFieldEmpty('jean@example.com')).toBe(false);
  });

  it('returns false for "false" string (not empty)', () => {
    expect(isFieldEmpty('false')).toBe(false);
  });

  it('returns true for a bare country code (HubSpot pre-filled phone)', () => {
    expect(isFieldEmpty('+33')).toBe(true);
    expect(isFieldEmpty('+1')).toBe(true);
    expect(isFieldEmpty(' +44 ')).toBe(true);
  });

  it('returns false for a full phone number with country code', () => {
    expect(isFieldEmpty('+33612345678')).toBe(false);
    expect(isFieldEmpty('+1 416 555 0100')).toBe(false);
  });
});

describe('computeScore', () => {
  it('returns 100 when all fields filled (6/6)', () => {
    expect(computeScore(6, 6)).toBe(100);
  });

  it('returns 0 when no fields filled', () => {
    expect(computeScore(0, 6)).toBe(0);
  });

  it('returns 67 for 4/6 (rounded)', () => {
    expect(computeScore(4, 6)).toBe(67);
  });

  it('returns 17 for 1/6 (rounded)', () => {
    expect(computeScore(1, 6)).toBe(17);
  });

  it('returns 83 for 5/6 (rounded)', () => {
    expect(computeScore(5, 6)).toBe(83);
  });

  it('returns 0 when totalFields is 0 (safe guard)', () => {
    expect(computeScore(0, 0)).toBe(0);
  });

  // V2: Dynamic N
  it('returns 75 for 6/8 fields (V2 dynamic N)', () => {
    expect(computeScore(6, 8)).toBe(75);
  });
});

describe('getScoreColor', () => {
  it(`returns green when score equals SCORE_GREEN_THRESHOLD (${SCORE_GREEN_THRESHOLD})`, () => {
    expect(getScoreColor(SCORE_GREEN_THRESHOLD)).toBe('green');
  });

  it('returns green when score is 100', () => {
    expect(getScoreColor(100)).toBe('green');
  });

  it('returns green when score is 83', () => {
    expect(getScoreColor(83)).toBe('green');
  });

  it(`returns orange when score equals SCORE_ORANGE_THRESHOLD (${SCORE_ORANGE_THRESHOLD})`, () => {
    expect(getScoreColor(SCORE_ORANGE_THRESHOLD)).toBe('orange');
  });

  it('returns orange when score is 67', () => {
    expect(getScoreColor(67)).toBe('orange');
  });

  it('returns orange at score 79 (below green, at or above orange)', () => {
    expect(getScoreColor(79)).toBe('orange');
  });

  it('returns red when score is 49 (below orange)', () => {
    expect(getScoreColor(49)).toBe('red');
  });

  it('returns red when score is 0', () => {
    expect(getScoreColor(0)).toBe('red');
  });

  it('returns red when score is 17', () => {
    expect(getScoreColor(17)).toBe('red');
  });
});

describe('getMissingFields', () => {
  describe('contacts (using FIELD_CONFIG.contacts)', () => {
    const contactFields = FIELD_CONFIG.contacts;

    it('returns all 8 fields when properties is empty', () => {
      const missing = getMissingFields(contactFields, {});
      expect(missing).toHaveLength(8);
      expect(missing).toContain('firstname');
      expect(missing).toContain('lastname');
      expect(missing).toContain('email');
      expect(missing).toContain('phone');
      expect(missing).toContain('company');
      expect(missing).toContain('jobtitle');
      expect(missing).toContain('lifecyclestage');
      expect(missing).toContain('hubspot_owner_id');
    });

    it('returns empty array when all fields are filled', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        company: 'Acme',
        jobtitle: 'Manager',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      expect(getMissingFields(contactFields, props)).toHaveLength(0);
    });

    it('detects phone as missing when null', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: null,
        company: 'Acme',
        jobtitle: 'Manager',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      const missing = getMissingFields(contactFields, props);
      expect(missing).toContain('phone');
      expect(missing).toHaveLength(1);
    });

    it('detects hubspot_owner_id as missing when "0"', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33612345678',
        lifecyclestage: 'customer',
        hubspot_owner_id: '0',
      };
      const missing = getMissingFields(contactFields, props);
      expect(missing).toContain('hubspot_owner_id');
    });

    it('detects phone as missing when it only holds a country code', () => {
      const props = {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@example.com',
        phone: '+33',
        company: 'Acme',
        jobtitle: 'Manager',
        lifecyclestage: 'customer',
        hubspot_owner_id: '12345',
      };
      const missing = getMissingFields(contactFields, props);
      expect(missing).toEqual(['phone']);
    });
  });

  describe('companies (using FIELD_CONFIG.companies)', () => {
    const companyFields = FIELD_CONFIG.companies;

    it('returns all 8 fields when properties is empty', () => {
      const missing = getMissingFields(companyFields, {});
      expect(missing).toHaveLength(8);
      expect(missing).toContain('name');
      expect(missing).toContain('domain');
      expect(missing).toContain('industry');
      expect(missing).toContain('phone');
      expect(missing).toContain('city');
      expect(missing).toContain('country');
      expect(missing).toContain('numberofemployees');
      expect(missing).toContain('hubspot_owner_id');
    });

    it('returns empty array when all company fields are filled', () => {
      const props = {
        name: 'Acme Corp',
        domain: 'acme.com',
        industry: 'TECHNOLOGY',
        phone: '+33123456789',
        city: 'Paris',
        country: 'France',
        numberofemployees: '100',
        hubspot_owner_id: '99999',
      };
      expect(getMissingFields(companyFields, props)).toHaveLength(0);
    });
  });

  describe('V2: custom fields array', () => {
    it('returns missing fields from custom field list', () => {
      const customFields = ['email', 'phone', 'jobtitle'];
      const props = { email: 'test@example.com', phone: null, jobtitle: null };
      const missing = getMissingFields(customFields, props);
      expect(missing).toContain('phone');
      expect(missing).toContain('jobtitle');
      expect(missing).not.toContain('email');
    });

    it('returns empty array for empty fields list', () => {
      const missing = getMissingFields([], { email: 'test@example.com' });
      expect(missing).toHaveLength(0);
    });
  });
});

// V2: getEffectiveFieldConfig
describe('getEffectiveFieldConfig', () => {
  it('returns configuredFields when provided and non-empty', () => {
    const custom = ['email', 'phone', 'jobtitle'];
    const result = getEffectiveFieldConfig('contacts', custom);
    expect(result).toEqual(custom);
  });

  it('returns FIELD_CONFIG.contacts when configuredFields is null', () => {
    const result = getEffectiveFieldConfig('contacts', null);
    expect(result).toEqual(FIELD_CONFIG.contacts);
  });

  it('returns FIELD_CONFIG.companies when configuredFields is undefined', () => {
    const result = getEffectiveFieldConfig('companies', undefined);
    expect(result).toEqual(FIELD_CONFIG.companies);
  });

  it('returns FIELD_CONFIG fallback when configuredFields is empty array', () => {
    const result = getEffectiveFieldConfig('contacts', []);
    expect(result).toEqual(FIELD_CONFIG.contacts);
  });
});

// V2: validateAdminConfig
describe('validateAdminConfig', () => {
  it('returns true for non-empty array', () => {
    expect(validateAdminConfig(['email'])).toBe(true);
    expect(validateAdminConfig(['email', 'phone', 'firstname'])).toBe(true);
  });

  it('returns false for empty array (E11)', () => {
    expect(validateAdminConfig([])).toBe(false);
  });

  it('returns false for non-array input', () => {
    expect(validateAdminConfig(null as unknown as string[])).toBe(false);
  });
});

// V2: isAdminConfigCacheValid
describe('isAdminConfigCacheValid', () => {
  it('returns true when cache is fresh (just set)', () => {
    const now = Date.now();
    expect(isAdminConfigCacheValid(now)).toBe(true);
  });

  it('returns false when cache is expired (older than TTL)', () => {
    const expiredAt = Date.now() - ADMIN_CONFIG_CACHE_TTL_MS - 1000;
    expect(isAdminConfigCacheValid(expiredAt)).toBe(false);
  });

  it('returns true when cache is just at TTL boundary', () => {
    const justFresh = Date.now() - ADMIN_CONFIG_CACHE_TTL_MS + 1000;
    expect(isAdminConfigCacheValid(justFresh)).toBe(true);
  });
});
