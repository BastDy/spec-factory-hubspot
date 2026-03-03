// Application layer — useAdminConfig hook (V2)
// Manages reading and saving admin field configuration via HubSpot Settings API.
// Cache: 5-minute TTL. Fallback: V1 default 6 fields when Settings API is unavailable.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SETTINGS_KEY_CONTACTS,
  SETTINGS_KEY_COMPANIES,
  ADMIN_CONFIG_CACHE_TTL_MS,
  FIELD_CONFIG,
} from '../domain/constants';
import { validateAdminConfig, isAdminConfigCacheValid } from '../domain/scoring';
import type { AdminConfig } from '../domain/types';

export interface UseAdminConfigResult {
  config: AdminConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveConfig: (newConfig: AdminConfig) => Promise<void>;
  resetConfig: () => Promise<void>;
}

interface CacheEntry {
  config: AdminConfig;
  cachedAt: number;
}

/**
 * Hook managing admin configuration of required fields via HubSpot Settings API.
 *
 * Rules:
 * - Reads Settings API on mount: contacts key + companies key
 * - If Settings API is empty or errors: config = null (fallback handled by useCompletenessScore)
 * - Cache TTL 5 minutes: reuses cached value without API call if still valid
 * - Cache invalidated after saveConfig() or resetConfig() succeeds
 * - saveConfig() validates min 1 field per objectType (E11)
 * - resetConfig() restores V1 default 6 fields from FIELD_CONFIG
 *
 * The settingsApi parameter is injectable for testability:
 * { get(key): Promise<string|null>, set(key, value): Promise<void> }
 *
 * @returns Config + save/reset actions
 *
 * @example
 * const { config, saveConfig, resetConfig } = useAdminConfig();
 * // config?.contacts = ['firstname', 'email', 'phone', ...]
 */
export function useAdminConfig(settingsApi?: {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
}): UseAdminConfigResult {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory cache shared across re-renders
  const cacheRef = useRef<CacheEntry | null>(null);

  const fetchConfig = useCallback(async () => {
    // Return cached config if still valid
    if (cacheRef.current && isAdminConfigCacheValid(cacheRef.current.cachedAt)) {
      setConfig(cacheRef.current.config);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!settingsApi) {
        // No settings API provided — use null (fallback to V1 defaults)
        setConfig(null);
        setIsLoading(false);
        return;
      }

      const [contactsRaw, companiesRaw] = await Promise.all([
        settingsApi.get(SETTINGS_KEY_CONTACTS),
        settingsApi.get(SETTINGS_KEY_COMPANIES),
      ]);

      const contacts: string[] = contactsRaw
        ? JSON.parse(contactsRaw)
        : null;
      const companies: string[] = companiesRaw
        ? JSON.parse(companiesRaw)
        : null;

      if (!contacts && !companies) {
        // No config stored yet — fallback to null
        setConfig(null);
        setIsLoading(false);
        return;
      }

      const resolvedConfig: AdminConfig = {
        contacts: contacts || FIELD_CONFIG.contacts,
        companies: companies || FIELD_CONFIG.companies,
      };

      cacheRef.current = { config: resolvedConfig, cachedAt: Date.now() };
      setConfig(resolvedConfig);
    } catch {
      // Settings API error — fallback transparent (config = null, V1 defaults used)
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, [settingsApi]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = useCallback(async (newConfig: AdminConfig) => {
    // E11: Validate min 1 field per objectType
    if (!validateAdminConfig(newConfig.contacts)) {
      setError('Au moins 1 champ requis pour les contacts');
      return;
    }
    if (!validateAdminConfig(newConfig.companies)) {
      setError('Au moins 1 champ requis pour les companies');
      return;
    }

    if (!settingsApi) {
      setError('Settings API non disponible');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await Promise.all([
        settingsApi.set(SETTINGS_KEY_CONTACTS, JSON.stringify(newConfig.contacts)),
        settingsApi.set(SETTINGS_KEY_COMPANIES, JSON.stringify(newConfig.companies)),
      ]);

      // Invalidate cache after successful save
      cacheRef.current = { config: newConfig, cachedAt: Date.now() };
      setConfig(newConfig);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde de la configuration';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [settingsApi]);

  const resetConfig = useCallback(async () => {
    const defaultConfig: AdminConfig = {
      contacts: [...FIELD_CONFIG.contacts],
      companies: [...FIELD_CONFIG.companies],
    };

    if (!settingsApi) {
      // No API: just reset local state
      cacheRef.current = { config: defaultConfig, cachedAt: Date.now() };
      setConfig(defaultConfig);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await Promise.all([
        settingsApi.set(SETTINGS_KEY_CONTACTS, JSON.stringify(defaultConfig.contacts)),
        settingsApi.set(SETTINGS_KEY_COMPANIES, JSON.stringify(defaultConfig.companies)),
      ]);

      // Invalidate cache after reset
      cacheRef.current = { config: defaultConfig, cachedAt: Date.now() };
      setConfig(defaultConfig);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation de la configuration';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }, [settingsApi]);

  return {
    config,
    isLoading,
    isSaving,
    error,
    saveConfig,
    resetConfig,
  };
}
