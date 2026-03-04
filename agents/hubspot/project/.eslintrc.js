module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]' }],
    'no-console': 'warn'
  },
  overrides: [
    {
      files: ['src/__tests__/**/*.{js,jsx}', 'src/**/__mocks__/**/*.{js,jsx}'],
      env: {
        jest: true,
        node: true
      },
      rules: {
        'no-unused-vars': ['error', { varsIgnorePattern: '^([A-Z]|screen)' }]
      }
    }
  ]
};
