const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.git/', 'coverage/', '.env', '.env.local'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // ESLint Core Rules
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'complexity': ['warn', 18],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2],
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
      'import/no-unresolved': ['error', { ignore: ['^necrobot-'] }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
    },
  },
];
