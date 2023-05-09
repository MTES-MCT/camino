import { Meta, StoryFn } from '@storybook/vue3'
import { TitreTypeTypeNom } from './titre-type-type-nom'

const meta: Meta = {
  title: 'Components/common/TitreTypeTypeNom',
  component: TitreTypeTypeNom,
}

export default meta

export const Default: StoryFn = () => <TitreTypeTypeNom titreTypeId="apc" />
