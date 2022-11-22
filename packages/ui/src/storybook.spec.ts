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
    push: () => {}
  }))
}))

vi.mock('vuex', () => ({ useStore: vi.fn() }))

describe('Storybook Smoke Test', async () => {
  const modules = await Promise.all(
    Object.values(import.meta.glob<StoryFile>('../**/*.stories.ts')).map(fn =>
      fn()
    )
  )
  describe.each(
    modules.map(module => ({ name: module.default.title, module }))
  )('$name', ({ name, module }) => {
    test
      .skipIf(name?.includes('NoStoryshots'))
      .each(
        Object.entries<ContextedStory<unknown>>(composeStories(module)).map(
          ([name, story]) => ({ name, story })
        )
      )('$name', ({ story }) => {
      const mounted = render(story(), {
        global: {
          components: { 'router-link': h('a', { type: 'primary' }) }
        }
      })
      expect(mounted.html()).toMatchSnapshot()
    })
  })
})
