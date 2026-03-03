// Application layer — useCompletenessScore hook
// Orchestrates domain services. No UI or SDK imports.

import { useMemo } from 'react';
import { FIELD_CONFIG } from '../domain/constants';
import { computeScore, getMissingFields, getScoreColor, getEffectiveFieldConfig } from '../domain/scoring';
import type { CompletenessResult, ObjectType } from '../domain/types';

/**
 * Unique polymorphic hook covering contacts and companies.
 *
 * Accepts any string for objectType — returns safe error state for unknown types.
 * Accepts optional configuredFields for V2 dynamic score (N fields instead of fixed 6).
 *
 * @param objectType - CRM object type: 'contacts' | 'companies' (or unknown)
 * @param properties - CRM properties map from HubSpot SDK
 * @param configuredFields - V2: admin-configured fields (overrides default 6 fields)
 * @returns CompletenessResult with score, color, missingFields, isComplete, totalFields
 */
export function useCompletenessScore(
  objectType: 'contacts' | 'companies' | string,
  properties: Record<string, string | null | undefined>,
  configuredFields?: string[] // V2: dynamic field config from admin
): CompletenessResult {
  return useMemo(() => {
    // Unknown object type — return safe error state
    if (objectType !== 'contacts' && objectType !== 'companies') {
      if (process.env.NODE_ENV !== 'test') {
        console.warn(
          `[DataQualityScore] Unknown objectType: "${objectType}". Expected "contacts" or "companies".`
        );
      }
      return {
        score: 0,
        color: 'red',
        missingFields: [],
        isComplete: false,
        totalFields: 0,
      };
    }

    const validType = objectType as ObjectType;

    // V2: Use configured fields if provided, else fallback to default V1 config
    const effectiveFields = getEffectiveFieldConfig(validType, configuredFields);
    const totalFields = effectiveFields.length;

    const missingFields = getMissingFields(effectiveFields, properties);
    const filledCount = totalFields - missingFields.length;
    const score = computeScore(filledCount, totalFields);
    const color = getScoreColor(score);

    return {
      score,
      color,
      missingFields,
      isComplete: score === 100,
      totalFields,
    };
  }, [objectType, properties, configuredFields]);
}
