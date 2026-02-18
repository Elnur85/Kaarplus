module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
  overrides: [
    {
      // Test files: relax strict rules that are impractical for mocks and stubs
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/setup.ts'],
      rules: {
        // Test mocks legitimately need `any` for typed prisma/vi.fn() stubs
        '@typescript-eslint/no-explicit-any': 'off',
        // Test setup files may import types used only for side effects
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        // Vitest requires vi.mock() to be called before the module import it mocks.
        // This intentionally conflicts with standard import ordering — disable for tests.
        'import/order': 'off',
      },
    },
  ],
};
