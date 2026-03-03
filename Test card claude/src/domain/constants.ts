// Domain constants for Data Quality Score
// No magic numbers — all thresholds defined here

// Score color thresholds (inclusive)
export const SCORE_GREEN_THRESHOLD = 80;
export const SCORE_ORANGE_THRESHOLD = 50;

// Critical fields configuration by object type
export const FIELD_CONFIG: Record<'contacts' | 'companies', string[]> = {
  contacts: [
    'firstname',
    'lastname',
    'email',
    'phone',
    'lifecyclestage',
    'hubspot_owner_id',
  ],
  companies: [
    'name',
    'domain',
    'industry',
    'phone',
    'country',
    'hubspot_owner_id',
  ],
};

// Display labels for badge UX
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  firstname: 'Prénom',
  lastname: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  lifecyclestage: 'Lifecycle Stage',
  hubspot_owner_id: 'Propriétaire',
  name: 'Nom',
  domain: 'Domaine',
  industry: 'Industrie',
  country: 'Pays',
};

// V2: Settings API keys for admin config
export const SETTINGS_KEY_CONTACTS = 'data_quality_required_fields_contacts';
export const SETTINGS_KEY_COMPANIES = 'data_quality_required_fields_companies';

// V2: Cache TTL for admin config (5 minutes in ms)
export const ADMIN_CONFIG_CACHE_TTL_MS = 5 * 60 * 1000;
