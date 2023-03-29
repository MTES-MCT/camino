import { CaminoError } from './error'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Error',
  component: CaminoError,
  argTypes: {},
}
export default meta

export const Success: Story = () => <CaminoError couleur="success" message="Bravo c’est un succès" />
export const Info: Story = () => <CaminoError couleur="info" message="Message à caractère informatif" />
export const Warning: Story = () => <CaminoError couleur="warning" message="Attention danger" />
export const Erreur: Story = () => <CaminoError couleur="error" message="Erreur, c’est cassé." />
