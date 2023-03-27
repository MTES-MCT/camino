import { Meta, Story } from '@storybook/vue3'
import { TitreNom } from './titre-nom'

const meta: Meta = {
  title: 'Components/common/TitreNom',
  component: TitreNom,
}

export default meta

export const Default: Story = () => <TitreNom nom="Nom du titre" />
export const Empty: Story = () => <TitreNom />
