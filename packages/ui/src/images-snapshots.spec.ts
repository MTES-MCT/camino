import { describe, expect, test, vi, beforeAll, afterAll } from 'vitest'
import type { Meta, StoryFn } from '@storybook/vue3'
import { render } from '@testing-library/vue'
import { composeStories } from '@storybook/vue3'
import { h } from 'vue'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { nodeHtmlToImage, getPuppeteerCluster } from '@/node-html-to-image/node-html-to-image'
import { Cluster } from 'puppeteer-cluster'

type StoryFile = {
  default: Meta
  [name: string]: StoryFn | Meta
}
// console.error = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {},
  })),
}))

declare module 'vitest' {
  interface Assertion<T> {
    toMatchImageSnapshot(): T
  }
}

expect.extend({ toMatchImageSnapshot })

vi.mock('vuex', () => ({ useStore: vi.fn() }))

const compose = (entry: StoryFile): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry)
  } catch (e) {
    throw new Error(`Un fichier est probablement mal formaté ${JSON.stringify(entry)}, ${e}`)
  }
}
let cluster: Cluster | null = null
beforeAll(async () => {
  console.log('get cluster')
  cluster = await getPuppeteerCluster()
  console.log('got cluster')
})

afterAll(async () => {
  await cluster?.idle()
  await cluster?.close()
})
describe.concurrent('Storybook Tests', () => {
  const modules = Object.entries(import.meta.glob<StoryFile>('../**/utilisateur.stories.ts(x)?', { eager: true })).map(([filePath, storyFile]) => ({ filePath, storyFile }))
  describe.concurrent.each(
    modules.map(({ filePath, storyFile }) => {
      return { name: storyFile.default.title, storyFile, filePath }
    })
  )('$name', ({ name, storyFile, filePath }) => {
    test.skipIf(name?.includes('NoStoryshots')).concurrent.each(
      Object.entries(compose(storyFile))
        .map(([name, story]) => ({ name, story }))
        .filter(env => (name ?? '').includes('NoStoryshots') || !(env.name ?? '').includes('NoSnapshot'))
    )('$name', async value => {
      // @ts-ignore
      window.dsfr = { mode: 'vue' }
      const mounted = render(value.story(), {
        global: {
          components: { 'router-link': (props, { slots }) => h('a', { ...props, type: 'primary', to: JSON.stringify(props.to).replaceAll('"', '') }, slots.default?.()) },
        },
      })
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1))

      let css = ``
      const moduls = import.meta.glob('../**/*.css', { eager: true, query: '?inline' })
      for (const path in moduls) {
        // console.log('css', moduls)
        css += moduls[path].default
      }

      const storyHtml = mounted.html()

      if (cluster) {
        const buffer = await nodeHtmlToImage({
          cluster,
          html: `
        <html lang='fr'>
        <style>
        ${css}
        </style>

</head>
          <body>
            ${storyHtml}
          </body>
        </html>

        `,
        })

        expect(buffer).toMatchImageSnapshot({ customSnapshotIdentifier: `${filePath}_${value.name}` })
      }
    })
  })
})
