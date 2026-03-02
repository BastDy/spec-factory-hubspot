// ESLint configuration for HubSpot UI Extensions project
// Follows HubSpot recommended config

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // No magic numbers in domain layer — enforced by naming convention
    'no-magic-numbers': ['warn', {
      ignore: [0, 1, 100, -1],
      ignoreArrayIndexes: true,
      enforceConst: true,
    }],
    // Warn on console.log — only console.warn/error allowed
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      // TypeScript files
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-unused-vars': 'warn',
      },
    },
  ],
};
