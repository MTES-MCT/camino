import type { KnipConfig } from 'knip';

const compiler = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;

const config: KnipConfig = {
  "ignore": ["babel.config.js", ".history"],
  "workspaces": {
    "packages/api": {
      "entry": "src/index.ts",
      "project": "**/*.ts"
    },
    "packages/ui": {
      "entry": "src/index.ts",
      "project": ["src/**/*.ts(x)", "src/**/*.js"]
    }
  },
  compilers: {
    vue: text => {
      const scripts: string[] = [];
      let match: RegExpExecArray | null = null;
      while ((match = compiler.exec(text))) scripts.push(match[1]);
      return scripts.join(';');
    },
  },
}
export default config


