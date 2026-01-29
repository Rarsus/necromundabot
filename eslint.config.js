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
      '**/package-lock.json',
    ],
  },

  // Base recommended config
  js.configs.recommended,

  // Main configuration for root-level and script files
  {
    files: ['*.js', 'scripts/**/*.js', 'src/**/*.js'],
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
      // ESLint Core Rules
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      complexity: ['warn', 18],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      'arrow-spacing': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'no-implicit-globals': 'error',
      'no-shadow': 'warn',
      'no-use-before-define': ['error', { functions: false }],

      // Import Rules
      'import/no-unresolved': ['error', { ignore: ['^@rarsus/necrobot-', '^necrobot-'] }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

      // Security Rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.js', 'tests/**/*.js'],
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
