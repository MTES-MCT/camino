import inject from '@rollup/plugin-inject'
import nodeResolve from '@rollup/plugin-node-resolve'
import type { RollupOptions } from 'rollup'

export const rollupOptions: RollupOptions = {
  plugins: [
    inject({
      process: 'process',
    }),
    // encore un problème avec jsondiffpatch https://github.com/vitejs/vite/issues/7385#issuecomment-1286606298
    nodeResolve({
      // browser: true
    }),
  ],
}
