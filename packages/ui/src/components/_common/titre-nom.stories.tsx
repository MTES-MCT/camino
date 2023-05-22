import { Meta, StoryFn } from '@storybook/vue3'
import { TitreNom } from './titre-nom'

const meta: Meta = {
  title: 'Components/Common/TitreNom',
  component: TitreNom,
}

export default meta

export const Default: StoryFn = () => <TitreNom nom="Nom du titre" />
export const Empty: StoryFn = () => <TitreNom />
