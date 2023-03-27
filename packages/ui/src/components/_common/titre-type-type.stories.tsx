import { Meta, Story } from '@storybook/vue3'
import { TitreTypeTypeNom } from './titre-type-type-nom'

const meta: Meta = {
  title: 'Components/common/TitreTypeTypeNom',
  component: TitreTypeTypeNom,
}

export default meta

export const Default: Story = () => <TitreTypeTypeNom titreTypeId="apc" />
