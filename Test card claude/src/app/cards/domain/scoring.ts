// Pure domain functions for Data Quality Score
// No external dependencies — fully testable without HubSpot SDK

import { FIELD_CONFIG, SCORE_GREEN_THRESHOLD, SCORE_ORANGE_THRESHOLD, ADMIN_CONFIG_CACHE_TTL_MS } from './constants';
import type { ObjectType, ScoreColor } from './types';

/**
 * Checks whether a CRM property value is considered empty.
 *
 * A value is empty when:
 * - null or undefined
 * - empty string ""
 * - "0" (hubspot_owner_id with no assigned owner)
 * - string composed only of whitespace
 */
export function isFieldEmpty(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (value === '0') return true;
  return value.trim() === '';
}

/**
 * Computes the completeness score as an integer 0-100.
 *
 * Formula: Math.round((filledCount / totalFields) * 100)
 */
export function computeScore(filledCount: number, totalFields: number): number {
  if (totalFields === 0) return 0;
  return Math.round((filledCount / totalFields) * 100);
}

/**
 * Returns the ScoreColor based on thresholds.
 *
 * - score >= SCORE_GREEN_THRESHOLD (80)  → 'green'
 * - score >= SCORE_ORANGE_THRESHOLD (50) → 'orange'
 * - score < 50                           → 'red'
 */
export function getScoreColor(score: number): ScoreColor {
  if (score >= SCORE_GREEN_THRESHOLD) return 'green';
  if (score >= SCORE_ORANGE_THRESHOLD) return 'orange';
  return 'red';
}

/**
 * Returns the list of critical fields that are empty for the given object.
 *
 * Accepts the list of fields to check directly.
 * Returns an empty array if fields is empty.
 */
export function getMissingFields(
  fields: string[],
  properties: Record<string, string | null | undefined>
): string[] {
  if (!fields || fields.length === 0) return [];

  return fields.filter((field) => isFieldEmpty(properties[field]));
}

// V2: Returns effective field config — configuredFields if provided, else FIELD_CONFIG default
export function getEffectiveFieldConfig(
  objectType: ObjectType,
  configuredFields: string[] | null | undefined
): string[] {
  if (configuredFields && configuredFields.length > 0) {
    return configuredFields;
  }
  return FIELD_CONFIG[objectType] || [];
}

// V2: Validates admin config — must have at least 1 field (E11)
export function validateAdminConfig(fields: string[]): boolean {
  return Array.isArray(fields) && fields.length >= 1;
}

// V2: Checks if admin config cache is still valid (TTL 5 min)
export function isAdminConfigCacheValid(cachedAt: number): boolean {
  return cachedAt + ADMIN_CONFIG_CACHE_TTL_MS > Date.now();
}
