import React from 'react';
import { Text } from '@hubspot/ui-extensions';
import { FIELD_DISPLAY_NAMES } from '../domain/constants';
import { BADGE_BG_COLOR, TEXT_COLOR } from '../domain/colors';

/**
 * MissingFieldBadges — Displays colored badge list for each empty critical field.
 *
 * Renders nothing when missingFields is empty (score === 100).
 * Each badge has an aria-label for screen reader accessibility.
 *
 * @param {string[]} missingFields - Array of field names that are empty
 * @param {'green'|'orange'|'red'} color - Score color (used for badge accent)
 */
export function MissingFieldBadges({ missingFields, color }) {
  if (!missingFields || missingFields.length === 0) {
    return null;
  }

  const badgeBg = BADGE_BG_COLOR[color];
  const badgeText = TEXT_COLOR[color];

  return (
    <div style={{ marginBottom: 12 }}>
      <Text format={{ fontWeight: 'demibold' }}>
        Champs manquants :
      </Text>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 6,
        }}
      >
        {missingFields.map((field) => {
          const label = FIELD_DISPLAY_NAMES[field] || field;
          return (
            <span
              key={field}
              aria-label={`Champ manquant : ${label}`}
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: badgeBg,
                color: badgeText,
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${badgeText}`,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
