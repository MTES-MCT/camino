import { Footer } from './footer'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Page/Footer',
  component: Footer,
  argTypes: {},
}
export default meta

export const AvecNewsletter: StoryFn = () => <Footer version="310c30f5b4d779cd4bc17316f4b026292bb95c10" displayNewsletter={true} />

export const SansNewsletter: StoryFn = () => <Footer version="310c30f5b4d779cd4bc17316f4b026292bb95c10" displayNewsletter={false} />
