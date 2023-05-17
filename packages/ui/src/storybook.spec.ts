import { describe, expect, test, vi } from 'vitest'
import type { Meta, StoryFn } from '@storybook/vue3'
import { render } from '@testing-library/vue'
import { composeStories } from '@storybook/testing-vue3'
import type { ContextedStory } from '@storybook/testing-vue3/dist/types'
import { h } from 'vue'

type StoryFile = {
  default: Meta
  [name: string]: StoryFn | Meta
}
console.error = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn(() => ({
    push: () => {},
  })),
}))

vi.mock('vuex', () => ({ useStore: vi.fn() }))

const compose = (entry: StoryFile) => {
  try {
    // @ts-ignore waiting for https://github.com/storybookjs/testing-vue3/issues/10
    return composeStories(entry)
  } catch (e) {
    throw new Error(`Un fichier est probablement mal formaté ${JSON.stringify(entry)}, ${e}`)
  }
}
describe('Storybook Tests', async () => {
  const modules = await Promise.all(Object.values(import.meta.glob<StoryFile>('../**/*.stories.ts(x)?')).map(fn => fn()))
  describe.each(
    modules.map(module => {
      return { name: module.default.title, module }
    })
  )('$name', ({ name, module }) => {
    test.skipIf(name?.includes('NoStoryshots')).each(
      Object.entries<ContextedStory<unknown>>(compose(module))
        .map(([name, story]) => ({ name, story }))
        .filter(env => name?.includes('NoStoryshots') || !env.name?.includes('NoSnapshot'))
    )('$name', async value => {
      // @ts-ignore
      window.dsfr = null
      const mounted = render(value.story(), {
        global: {
          components: { 'router-link': (props, { slots }) => h('a', { ...props, type: 'primary', to: JSON.stringify(props.to).replaceAll('"', '') }, slots.default?.()) },
        },
      })
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1))
      expect(mounted.html()).toMatchFileSnapshot(`./__snapshots__/${name}/${value.name}.html`)
    })
  })
})
