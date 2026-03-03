// ProgressBar — Displays the completeness score as a colored progress bar.
// V2: Shows "X/N champs" when totalFields is provided.

import React from 'react';
import { Text, Flex } from '@hubspot/ui-extensions';
import { BAR_COLOR, TEXT_COLOR } from '../domain/colors';

/**
 * ProgressBar — Displays the completeness score as a colored progress bar.
 *
 * Uses inline styles (no Tailwind — not supported in HubSpot UI Extensions).
 * Colors comply with WCAG AA contrast ratios on white background.
 *
 * @param {number} score - Integer 0-100
 * @param {'green'|'orange'|'red'} color - Score color category
 * @param {number} [totalFields] - V2: Total number of configured fields (for "X/N" display)
 */
export function ProgressBar({ score, color, totalFields }) {
  const barColor = BAR_COLOR[color];
  const textColor = TEXT_COLOR[color];
  const filledCount = totalFields ? Math.round((score / 100) * totalFields) : null;

  return (
    <Flex direction="column" gap="extra-small">
      <Text format={{ fontWeight: 'demibold' }}>
        Score de complétude
      </Text>

      {/* Score percentage and X/N fields label */}
      <Flex direction="row" justify="between" align="center">
        <span
          aria-label={`Score de complétude : ${score} pour cent`}
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: textColor,
          }}
        >
          {score}%
        </span>
        {/* V2: X/N fields display */}
        {totalFields != null && filledCount != null && (
          <span
            aria-label={`${filledCount} sur ${totalFields} champs renseignés`}
            style={{ fontSize: 13, color: '#666' }}
          >
            {filledCount}/{totalFields} champs
          </span>
        )}
      </Flex>

      {/* Progress bar track */}
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Barre de progression : ${score} pour cent`}
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#e0e0e0',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Progress bar fill */}
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </Flex>
  );
}
