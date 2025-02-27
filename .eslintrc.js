module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'node_modules',
    '.next',
    'out',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/tests/**',
    '**/test/**',
    '**/__tests__/**',
    '**/mocks/**',
    '**/fixtures/**',
    '**/cypress/**',
    'jest.config.js',
    'jest.setup.js'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports'
    }]
  }
} 