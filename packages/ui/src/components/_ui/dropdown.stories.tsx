import { Meta, Story } from '@storybook/vue3'
import { Dropdown, Props } from './dropdown'

const meta: Meta = {
  title: 'Components/UI/Dropdown',
  component: Dropdown,
}
export default meta

export const Default: Story = () => <Dropdown onToggle={_state => {}} title={() => <h2>Titre</h2>} content={() => <h5>Contenu</h5>} />

export const Opened: Story = () => <Dropdown onToggle={_state => {}} title={() => <h6>Titre</h6>} content={() => <h5>Contenu</h5>} open={true} />
