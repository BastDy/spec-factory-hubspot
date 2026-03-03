// V2: ModificationHistory — Displays the 3 most recent modifications in the session
// State stored in React memory — lost on page reload (D10, H10)

import React from 'react';
import { Text, Flex } from '@hubspot/ui-extensions';
import { FIELD_DISPLAY_NAMES } from '../domain/constants';

/**
 * ModificationHistory — Shows the last N (max 3) modifications made in the session.
 *
 * Rules:
 * - Max 3 entries (E15) — oldest removed beyond 3
 * - Stored in React memory (useState) — lost on reload
 * - Displays relative time (e.g., "il y a 2 min")
 * - Returns null if no modifications
 *
 * @param {Array} history - Array of ModificationRecord: { fieldName, timestamp, objectType }
 */
export function ModificationHistory({ history }) {
  if (!history || history.length === 0) {
    return null;
  }

  const getRelativeTime = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return "il y a quelques secondes";
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    return `il y a ${diffHours} h`;
  };

  return (
    <Flex direction="column" gap="extra-small">
      <Text format={{ fontWeight: 'demibold' }}>Dernières modifications :</Text>
      {history.map((record, index) => {
        const label = FIELD_DISPLAY_NAMES[record.fieldName] || record.fieldName;
        const relativeTime = getRelativeTime(record.timestamp);
        return (
          <Text key={`${record.fieldName}-${record.timestamp}-${index}`}>
            <span style={{ color: '#666', fontSize: 12 }}>
              {label} mis à jour {relativeTime}
            </span>
          </Text>
        );
      })}
    </Flex>
  );
}
