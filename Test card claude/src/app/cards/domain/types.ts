// Domain types for Data Quality Score
// No external dependencies — pure TypeScript

export type ObjectType = 'contacts' | 'companies';

export type ScoreColor = 'green' | 'orange' | 'red';

export interface CompletenessResult {
  score: number;          // Integer 0-100
  color: ScoreColor;      // Score color based on thresholds
  missingFields: string[]; // Names of empty critical fields
  isComplete: boolean;    // score === 100
  totalFields: number;    // N configured fields (V2 - for "X/N fields" display)
}

export interface FieldValidation {
  fieldName: string;
  value: string | null | undefined;
  isEmpty: boolean;
}

// V2: Field editing types
export type FieldType = 'text' | 'select' | 'date' | 'number' | 'checkbox' | 'owner';

export type EditStatus = 'idle' | 'saving' | 'success' | 'error';

export interface AdminConfig {
  contacts: string[];
  companies: string[];
}

export interface ModificationRecord {
  fieldName: string;
  timestamp: number;
  objectType: ObjectType;
}
