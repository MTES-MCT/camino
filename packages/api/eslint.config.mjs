import typescriptEslint from '@typescript-eslint/eslint-plugin'
import sql from 'eslint-plugin-sql'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ['*.mjs', 'api-cache', 'backups', 'coverage', 'dist', 'docs', 'files', 'node_modules', 'sources', '**/*.queries.types.ts'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      sql,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        GeoJSON: 'readonly',
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        project: true,
      },
    },

    rules: {
      camelcase: 0,

      'sql/format': [
        0,
        {
          ignoreExpressions: false,
          ignoreInline: true,
          ignoreTagless: true,
        },
      ],

      'sql/no-unsafe-query': [
        2,
        {
          allowLiteral: false,
        },
      ],

      'newline-before-return': 1,
      'no-use-before-define': 0,
      'no-redeclare': 0,
      'no-return-await': 'error',
      'default-param-last': 0,
      'no-unused-vars': 0,

      'no-restricted-syntax': 0,

      'no-console': [
        'error',
        {
          allow: ['debug', 'info', 'warn', 'error', 'time', 'timeEnd'],
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/ban-ts-comment': 0,

      '@typescript-eslint/no-unused-vars': 0, // on utilise typescript noUnusedLocals et noUnusedParameters à la place

      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-empty-object-type': 0,
    },
  },
  {
    files: ['**/src/database/models/*.ts'],

    rules: {
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['**/src/**/*.queries.ts', '**/src/pg-database.ts'],

    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'dbQueryAndValidate is to be used only in .queries.ts files',
          selector: "CallExpression[callee.name='dbQueryAndValidate']",
        },
        {
          message: 'leftJoinRelation is deprecated. Use leftJoinRelated instead.',
          selector: "Identifier[name='leftJoinRelation']",
        },
        {
          message: 'sort is deprecated. Use toSorted instead.',
          selector: "Identifier[name='sort']",
        },
        {
          message: "no 'run' call from PgTyped allowed. Use dbQueryAndValidate.",
          selector: "CallExpression[callee.property.name='run'][arguments.length=2]",
        },
      ],
    },
  },
]
