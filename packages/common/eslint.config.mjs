import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/vitest.config.ts"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "commonjs",

        parserOptions: {
            project: true,
        },
    },

    rules: {
        camelcase: 0,
        "newline-before-return": 1,
        "no-use-before-define": 0,
        "no-redeclare": 0,
        "no-return-await": "error",
        "default-param-last": 0,
        "no-unused-vars": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-expressions": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/strict-boolean-expressions": "error",
    },
}];
