// V2: Unit tests for hooks/useAdminConfig.ts
// Tests Settings API integration, caching, save/reset lifecycle

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminConfig } from '../app/cards/hooks/useAdminConfig';
import { FIELD_CONFIG } from '../app/cards/domain/constants';

const makeSettingsApi = (initialContacts?: string[], initialCompanies?: string[]) => ({
  data: {
    data_quality_required_fields_contacts: initialContacts ? JSON.stringify(initialContacts) : null,
    data_quality_required_fields_companies: initialCompanies ? JSON.stringify(initialCompanies) : null,
  } as Record<string, string | null>,
  get: jest.fn(async function (this: { data: Record<string, string | null> }, key: string) {
    return this.data[key] ?? null;
  }),
  set: jest.fn(async function (this: { data: Record<string, string | null> }, key: string, value: string) {
    this.data[key] = value;
  }),
});

describe('useAdminConfig', () => {
  describe('initial loading', () => {
    it('returns null config and isLoading=false when no settingsApi provided', async () => {
      const { result } = renderHook(() => useAdminConfig());
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.config).toBeNull();
    });

    it('returns null config when Settings API returns no stored values', async () => {
      const api = makeSettingsApi();
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.config).toBeNull();
    });

    it('loads stored config from Settings API', async () => {
      const contacts = ['firstname', 'email', 'phone'];
      const companies = ['name', 'domain', 'country'];
      const api = makeSettingsApi(contacts, companies);
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.config).toEqual({ contacts, companies });
    });

    it('returns null config on Settings API error (fallback transparent)', async () => {
      const api = {
        get: jest.fn().mockRejectedValue(new Error('Network error')),
        set: jest.fn(),
      };
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.config).toBeNull();
    });
  });

  describe('saveConfig', () => {
    it('saves new config and updates local state', async () => {
      const api = makeSettingsApi(['firstname', 'email'], ['name', 'domain']);
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newConfig = {
        contacts: ['firstname', 'email', 'phone', 'jobtitle'],
        companies: ['name', 'domain', 'country'],
      };

      await act(async () => {
        await result.current.saveConfig(newConfig);
      });

      expect(result.current.config).toEqual(newConfig);
      expect(api.set).toHaveBeenCalledWith(
        'data_quality_required_fields_contacts',
        JSON.stringify(newConfig.contacts)
      );
    });

    it('rejects save when contacts has 0 fields (E11)', async () => {
      const api = makeSettingsApi(['firstname', 'email'], ['name', 'domain']);
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveConfig({ contacts: [], companies: ['name'] });
      });

      expect(result.current.error).toBe('Au moins 1 champ requis pour les contacts');
      expect(api.set).not.toHaveBeenCalled();
    });

    it('rejects save when companies has 0 fields (E11)', async () => {
      const api = makeSettingsApi(['firstname', 'email'], ['name', 'domain']);
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveConfig({ contacts: ['email'], companies: [] });
      });

      expect(result.current.error).toBe('Au moins 1 champ requis pour les companies');
    });
  });

  describe('resetConfig', () => {
    it('resets config to V1 default 6 fields', async () => {
      const api = makeSettingsApi(['firstname', 'email'], ['name']);
      const { result } = renderHook(() => useAdminConfig(api));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.resetConfig();
      });

      expect(result.current.config).toEqual({
        contacts: FIELD_CONFIG.contacts,
        companies: FIELD_CONFIG.companies,
      });
    });

    it('resets local state even without settingsApi', async () => {
      const { result } = renderHook(() => useAdminConfig());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.resetConfig();
      });

      expect(result.current.config).toEqual({
        contacts: FIELD_CONFIG.contacts,
        companies: FIELD_CONFIG.companies,
      });
    });
  });
});
