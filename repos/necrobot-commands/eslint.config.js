const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const securityPlugin = require('eslint-plugin-security');
const globals = require('globals');

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/.env',
      '**/.env.local',
    ],
  },

  // Base recommended config
  js.configs.recommended,

  // Main configuration for source files
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
      security: securityPlugin,
    },
    rules: {
      // Core Rules (Airbnb-compatible)
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      complexity: ['warn', 18],
      'no-param-reassign': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'arrow-body-style': ['warn', 'as-needed'],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'arrow-spacing': 'error',
      'no-var': 'error',
      'no-implicit-globals': 'error',
      'no-shadow': 'warn',
      'no-use-before-define': ['error', { functions: false }],

      // Import Rules
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/newline-after-import': 'warn',
      'import/no-unresolved': ['error', { ignore: ['^@rarsus/necrobot-', '^necrobot-'] }],
      'import/no-extraneous-dependencies': 'warn',
      'import/no-named-as-default-member': 'warn',

      // Security Rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
    },
  },

  // Test files configuration
  {
    files: ['tests/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-expressions': 'off',
      'max-lines-per-function': 'off',
      'max-nested-callbacks': 'off',
      'max-depth': 'off',
      complexity: 'off',
      'no-return-await': 'off',
      'no-unused-vars': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-possible-timing-attacks': 'off',
    },
  },
];
