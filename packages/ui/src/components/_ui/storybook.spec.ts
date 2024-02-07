import { describe, expect, test, vi } from 'vitest'
import type { Meta, StoryFn } from '@storybook/vue3'
import { render } from '@testing-library/vue'
import { composeStories } from '@storybook/testing-vue3'
import { h } from 'vue'
import { setSeed } from '@/utils/vue-tsx-utils'

type StoryFile = {
  default: Meta
  [name: string]: StoryFn | Meta
}
console.error = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    name: 'mocked-current-route',
    query: {},
  })),
  onBeforeRouteLeave: vi.fn(),
  useLink: () => ({ href: { value: '/mocked-href' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    currentRoute: { value: { name: 'mocked-current-route', query: {} } },
  })),
}))

vi.mock('vuex', () => ({ useStore: vi.fn() }))

const compose = (entry: StoryFile): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry)
  } catch (e) {
    throw new Error(`Un fichier est probablement mal formaté ${JSON.stringify(entry)}, ${e}`)
  }
}
describe('UI Storybook Tests', async () => {
  const modules = Object.entries(import.meta.glob<StoryFile>(['./**/*.stories.ts(x)?'], { eager: true })).map(([filePath, storyFile]) => ({ filePath, storyFile }))
  describe.each(
    modules.map(({ filePath, storyFile }) => {
      return { name: storyFile.default.title, storyFile, filePath }
    })
  )('$name', ({ name, storyFile, filePath }) => {
    test.skipIf(name?.includes('NoStoryshots')).each(
      Object.entries(compose(storyFile))
        .map(([name, story]) => ({ name, story }))
        .filter(env => name?.includes('NoStoryshots') || !env.name?.includes('NoSnapshot'))
    )('$name', async value => {
      setSeed(12)
      try {
        // @ts-ignore
        window.dsfr = null
        const mounted = render(value.story(), {
          global: {
            components: { 'router-link': (props, { slots }) => h('a', { ...props, type: 'primary', to: JSON.stringify(props.to).replaceAll('"', '') }, slots) },
          },
        })

        await new Promise<void>(resolve => setTimeout(() => resolve(), 1))
        expect(mounted.html()).toMatchFileSnapshot(`./${filePath.replace(/\.[^/.]+$/, '')}_snapshots_${value.name}.html`)
      } catch (e) {
        throw new Error(`le test ${name} du fichier ${filePath} plante ${e}`)
      }
    })
  })
})
