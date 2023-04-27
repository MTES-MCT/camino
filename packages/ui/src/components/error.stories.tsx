import { CaminoError } from './error'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Error',
  component: CaminoError,
  argTypes: {},
}
export default meta

export const Success: StoryFn = () => <CaminoError couleur="success" message="Bravo c’est un succès" />
export const Info: StoryFn = () => <CaminoError couleur="info" message="Message à caractère informatif" />
export const Warning: StoryFn = () => <CaminoError couleur="warning" message="Attention danger" />
export const Erreur: StoryFn = () => <CaminoError couleur="error" message="Erreur, c’est cassé." />
