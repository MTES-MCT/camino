import { describe, expect, test } from 'vitest'
import type { Meta, StoryFn } from '@storybook/vue3'
import { render } from '@testing-library/vue'
import { composeStories } from '@storybook/testing-vue3'
import type { ContextedStory } from '@storybook/testing-vue3/dist/types'

type StoryFile = {
  default: Meta
  [name: string]: StoryFn | Meta
}

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
      const mounted = render(story())
      expect(mounted.html()).toMatchSnapshot()
    })
  })
})
