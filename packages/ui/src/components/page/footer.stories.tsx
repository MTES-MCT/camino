import { PureFooter } from './footer'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Pages/Footer',
  component: PureFooter,
  argTypes: {},
}
export default meta

export const AvecNewsletter: Story = () => <PureFooter version="310c30f5b4d779cd4bc17316f4b026292bb95c10" displayNewsletter={true} />

export const SansNewsletter: Story = () => <PureFooter version="310c30f5b4d779cd4bc17316f4b026292bb95c10" displayNewsletter={false} />
