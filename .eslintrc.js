module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Core Rules (Airbnb-compatible)
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'complexity': ['warn', 18],
    'no-param-reassign': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],

    // Import Rules
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabeticalOrder: true,
        caseInsensitive: true,
        newlines: 'always-and-inside-groups',
      },
    ],
    'import/newline-after-import': 'warn',
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': 'warn',
    'import/no-named-as-default-member': 'warn',

    // Security Rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-unused-expressions': 'off',
        'max-lines-per-function': 'off',
        'max-nested-callbacks': 'off',
        'max-depth': 'off',
        'complexity': 'off',
        'no-return-await': 'off',
        'no-unused-vars': 'off',
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-unsafe-regex': 'off',
        'security/detect-possible-timing-attacks': 'off',
      },
    },
  ],
  plugins: ['import', 'security'],
};
