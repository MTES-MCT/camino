import { describe, expect, test, vi, beforeAll, afterAll } from 'vitest'
import type { Meta, StoryFn } from '@storybook/vue3'
import { render } from '@testing-library/vue'
import { composeStories } from '@storybook/testing-vue3'
import type { ContextedStory } from '@storybook/testing-vue3/dist/types'
import { h } from 'vue'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
import {nodeHtmlToImage, getPuppeteerCluster} from '@/node-html-to-image/node-html-to-image'
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

const compose = (entry: StoryFile) => {
  try {
    // @ts-ignore waiting for https://github.com/storybookjs/testing-vue3/issues/10
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



  const modules = Object.entries(import.meta.glob<StoryFile>('../**/*.stories.ts(x)?', { eager: true })).map(([filePath, storyFile]) => ({ filePath, storyFile }))
  describe.concurrent.each(
    modules.map(({ filePath, storyFile }) => {
      return { name: storyFile.default.title, storyFile, filePath }
    })
  )('$name', ({ name, storyFile, filePath }) => {
    test.skipIf(name?.includes('NoStoryshots')).concurrent.each(
      Object.entries<ContextedStory<unknown>>(compose(storyFile))
        .map(([name, story]) => ({ name, story }))
        .filter(env => name?.includes('NoStoryshots') || !env.name?.includes('NoSnapshot'))
    )('$name', (value) => new Promise(async resolve => {
      // @ts-ignore
      window.dsfr = null
      const mounted = render(value.story(), {
        global: {
          components: { 'router-link': (props, { slots }) => h('a', { ...props, type: 'primary', to: JSON.stringify(props.to).replaceAll('"', '') }, slots.default?.()) },
        },
      })
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1))


      // let css = ``
      // const moduls = import.meta.glob('../**/styles.css', { eager: true, query: '?inline'})
      // for (const path in moduls) {
      //   css += moduls[path].default
      // }

      const storyHtml = mounted.html()

      // expect(storyHtml).toMatchFileSnapshot(`./${filePath.replace(/\.[^/.]+$/, '')}_snapshots_${value.name}.html`)



      if( cluster ){
        const now = new Date()
        console.log('nodeHtmlToImage begin', now)
      const buffer = await nodeHtmlToImage({
        cluster,
        html: `
        <html lang='fr'>
        <style>
        </style>

</head>
          <body>
            ${storyHtml}
          </body>
        </html>

        `,
      })
      console.log('nodeHtmlToImage end', new Date())



      // expect(buffer).toMatchImageSnapshot({customSnapshotIdentifier: `${filePath}_${value.name}`})
      }

      console.log('nodeHtmlToImage after expect', new Date())
      resolve()
    }))
  })
})
