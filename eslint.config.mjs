import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const projectSyntaxRules = [
  {
    selector: "CallExpression[callee.property.name='waitForTimeout']",
    message:
      'AGENTS.md: do not use waitForTimeout; wait for an observable condition.',
  },
  {
    selector: "Literal[value='networkidle']",
    message:
      'AGENTS.md: do not use networkidle; wait for an observable condition.',
  },
  {
    selector:
      "CallExpression[callee.object.name='test'][callee.property.name='only']",
    message: 'AGENTS.md: do not commit focused tests (test.only).',
  },
  {
    selector:
      "CallExpression[callee.object.object.name='test'][callee.object.property.name='describe'][callee.property.name='only']",
    message: 'AGENTS.md: do not commit focused suites (test.describe.only).',
  },
];

export default defineConfig(
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'blob-report/',
      'coverage/',
      '.playwright-mcp/',
      '.auth/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    rules: {
      eqeqeq: 'error',
      'no-console': 'error',
    },
  },
  // AGENTS.md project rules for test isolation and stable Playwright usage.
  {
    files: ['src/**/*.{ts,js,mjs,cjs}', 'tests/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-restricted-syntax': ['error', ...projectSyntaxRules],
    },
  },
  {
    files: ['tests/{ui,e2e}/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...projectSyntaxRules,
        {
          selector:
            'CallExpression[callee.property.name=/^(locator|frameLocator|\\$\\$?)$/]',
          message:
            'AGENTS.md: UI and E2E specs use Page Objects, not raw locators.',
        },
      ],
    },
  },
  {
    files: ['tests/ui/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/src/api/**'],
              message:
                'AGENTS.md: UI specs cannot import API clients; use the E2E layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/api/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/src/pages/**', '**/src/fixtures/**'],
              message:
                'AGENTS.md: API specs cannot import Page Objects or UI fixtures.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/utils/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message:
                'AGENTS.md: src/utils contains pure helpers without Playwright objects.',
            },
          ],
        },
      ],
    },
  },
);
