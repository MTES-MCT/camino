import { Error } from './error'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Error',
  component: Error,
  argTypes: {},
}
export default meta

export const Success: Story = () => <Error couleur="success" message="Bravo c’est un succès" />
export const Info: Story = () => <Error couleur="info" message="Message à caractère informatif" />
export const Warning: Story = () => <Error couleur="warning" message="Attention danger" />
export const Erreur: Story = () => <Error couleur="error" message="Erreur, c’est cassé." />
