const config = {
  ignore: ['**/eslint.config.mjs'],
  workspaces: {
    ".": {
      ignoreBinaries: [
        "eslint",
        "prettier",
      ],
      ignoreDependencies: [
        // TODO 2023-12-28 knip voit pas les override dependencies
        "vue",
        "@types/react",
        "@semantic-release/commit-analyzer",
        "@semantic-release/github",
        "@semantic-release/release-notes-generator",
        "playwright",
        "lint-staged"
      ],
    },
    "packages/api": {
      ignoreBinaries: [
        "createdb",
        "dropdb",
        "npm-check-updates",
        "pg_dump",
        "pg_restore",
        "pgtyped-config.ci.json",
        "pgtyped-config.json",
        "scp",
        "tar",
      ],
      ignore: ["knexfile.ts", "src/**/*.queries.types.ts"],
      entry: [
        "src/index.ts",
        "src/scripts/*",
        "src/tools/phases/tests-creation.ts",
        "src/knex/migration-stub.ts",
        "src/knex/migrations/*",
      ],
      ignoreDependencies: [
        // TODO 2023-12-28 ces dépendances semblent être "shadow" par les définitions bourrines .d.ts qu'on a mise
        "graphql-scalars",
        "@vitest/coverage-v8",
        "@pgtyped/cli",
        "eslint-config-prettier",
        "eslint-plugin-promise",
      ],
    },
    "packages/common": {
      ignoreDependencies: [
        "vite",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "node",
      ],
    },
    "packages/ui": {
      ignoreBinaries: ["npm-check-updates"],
      ignoreDependencies: [
        "@vitest/coverage-v8",
        "@babel/eslint-parser",
        "@vue/eslint-config-prettier",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "eslint-config-prettier",
        "eslint-plugin-promise",
        "babel-core",
        "babel-loader",
        "babel-preset-vite",
        "core-js",
        "eslint-plugin-node",
        "node",
        "rollup"
      ],
    },
  },
};
export default config;
