import globals from 'globals'
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
    ignores: ['!**/.storybook', 'dist', 'src/__snaphosts__/**/*'],
  },
  ...compat.extends('prettier'),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        localStorage: 'readonly',
        HTMLOrSVGElement: 'readonly',
        JSX: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        T: 'readonly',
        K: 'readonly',
        P: 'readonly',
        dsfr: 'readonly',
      },

      ecmaVersion: 5,
      sourceType: 'commonjs',

      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },

    rules: {
      camelcase: 0,
      'no-unused-vars': 0,
      'no-use-before-define': 0,
      '@typescript-eslint/ban-ts-comment': 0,
    },
  },
  ...compat.extends('plugin:@typescript-eslint/recommended').map(config => ({
    ...config,
    files: ['**/*.tsx', '**/*.ts', '**/*.js'],
  })),
  {
    files: ['**/*.tsx', '**/*.ts', '**/*.js'],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: true,
      },
    },

    rules: {
      camelcase: 0,
      'newline-before-return': 0,
      'no-use-before-define': 0,
      'no-redeclare': 0,
      'no-return-await': 'error',
      'default-param-last': 0,
      'no-unused-vars': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-interface': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/ban-ts-comment': 0,

      '@typescript-eslint/no-unused-vars': 0, // on utilise noUnusedLocals et noUnusedParams de tsconfig

      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/strict-boolean-expressions': 'error',

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue',
              importNames: ['capitalize'],
              message: 'Please use capitalize from camino-common/src/strings',
            },
            {
              name: 'vue-router',
              importNames: ['Router'],
              message: 'Please use CaminoRouter',
            },
            {
              name: 'vue-router',
              importNames: ['RouteLocationNormalized'],
              message: 'Please use CaminoRouteLocation',
            },
          ],
        },
      ],
    },
  },
]
