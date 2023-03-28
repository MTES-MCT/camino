import { PropDuree } from './prop-duree'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Etape/PropDuree',
  component: PropDuree,
  argTypes: {},
}
export default meta

export const Empty: Story = () => <PropDuree />
export const Mois: Story = () => <PropDuree duree={1} />
export const OneYear: Story = () => <PropDuree duree={12} />
export const TwoYears: Story = () => <PropDuree duree={24} />
export const Full: Story = () => <PropDuree duree={30} />
