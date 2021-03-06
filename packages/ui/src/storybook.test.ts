import initStoryshots, {
  Stories2SnapsConverter
} from '@storybook/addon-storyshots'
import { mount } from '@vue/test-utils'
import { resolve } from 'path'

initStoryshots({
  asyncJest: true,
  framework: 'vue3',
  suite: 'Automated Storybook Snapshots',
  configPath: '.storybook',
  storyKindRegex: /^((?!.*?NoStoryshots).)*$/,
  stories2snapsConverter: new Stories2SnapsConverter({
    snapshotExtension: '.storyshot',
    storiesExtensions: ['.js', '.ts', '.mdx']
  }),
  test: ({ story, context, stories2snapsConverter, done }) => {
    const snapshotFileName = resolve(
      stories2snapsConverter.getSnapshotFileName(context)
    )

    const waitTime = 50
    const storyElement = story.render()
    const wrapper = mount(storyElement)
    setTimeout(() => {
      if (snapshotFileName) {
        expect(wrapper.element).toMatchSpecificSnapshot(snapshotFileName)
      }

      done?.()
    }, waitTime)
  }
})
