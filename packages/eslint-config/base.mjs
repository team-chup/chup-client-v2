import { defineConfig, globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export const baseConfig = defineConfig([
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'dist/**',
    'out/**',
    'build/**',
    'public/**',
    'next-env.d.ts',
    '**/*.d.ts',
    'pnpm-lock.yaml',
    '.DS_Store',
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: { version: '19' },
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react$'], ['^next(/.*)?$'], ['^@?\\w'], ['^@/'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]);
