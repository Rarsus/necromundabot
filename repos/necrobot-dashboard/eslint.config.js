const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const securityPlugin = require('eslint-plugin-security');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
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
      '**/.next/**',
    ],
  },

  // Base recommended config
  js.configs.recommended,

  // Main configuration for source and test files
  {
    files: ['src/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
      security: securityPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ESLint Core Rules
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      complexity: ['warn', 18],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
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

      // React Rules
      'react/prop-types': 'warn',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/jsx-uses-react': 'off', // Not needed in Next.js

      // React Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Accessibility Rules
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/alt-text': 'warn',

      // Security Rules
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
    },
  },

  // Test files configuration
  {
    files: ['tests/**/*.{js,jsx}', '**/*.test.{js,jsx}'],
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
