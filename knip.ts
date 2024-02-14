const config = {
  "ignore": [".history/**", "packages/api/knexfile.ts", "**/knex/migrations/*", "packages/api/src/knex/migration-stub.ts", "packages/api/src/knex/seeding.ts", "packages/api/src/knex/seeds/**", "packages/common/src/**/*.test.ts", "packages/api/src/tools/phases/tests-creation.ts", "packages/ui/src/__mocks__/setupVitest.js", "packages/api/src/**/*.queries.types.ts"],
  "ignoreBinaries": [
  "eslint",
  "prettier",
  "createdb",
  "dropdb",
  "npm-check-updates",
  "pg_dump",
  "pg_restore",
  "pgtyped-config.ci.json",
  "pgtyped-config.json",
  "scp",
  "ssh",
  "tar",
  "eslint",
  "npm-check-updates",
  "ts-node",
  ],

  "workspaces": {
    ".": {
      ignoreDependencies: [
         // TODO 2023-12-28 knip voit pas les override dependencies
        "vue", "@types/react",
        "@semantic-release/commit-analyzer", "@semantic-release/github", "@semantic-release/release-notes-generator"
      ]
    },
    "packages/api": {
      "entry": ["src/index.ts", "src/scripts/*"],
      "project": "**/*.ts",
      ignoreDependencies: [
        // TODO 2023-12-28 ces dépendances semblent être "shadow" par les définitions bourrines .d.ts qu'on a mise
        "graphql-fields", "graphql-scalars", "html-to-text", "matomo-tracker",
        "@vitest/coverage-v8", "@pgtyped/cli"
      ]
    },
    "packages/common": {
      ignoreDependencies: ["@vitest/coverage-v8", "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", "node"]
    },
    "packages/ui": {
      "entry": "src/index.ts",
      "project": ["src/**/*.tsx","src/**/*.ts", "src/**/*.js", "src/**/*.vue"],
      ignoreDependencies: ["@vitest/coverage-v8",
      "@babel/eslint-parser",
      "@sentry/tracing",
      "@storybook/addon-styling",
      "@storybook/builder-vite",
      "@storybook/testing-library",
      "@vue/eslint-config-prettier",
      "@vue/eslint-config-standard",
      "babel-core",
      "babel-loader",
      "babel-preset-vite",
      "core-js",
      "eslint-plugin-node",
      "node"
    ]
    }
  },
}
export default config


