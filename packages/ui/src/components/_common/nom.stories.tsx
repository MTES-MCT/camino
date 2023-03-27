import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue3'
import { Nom } from './nom'
import { MultiPolygon, Feature } from 'geojson'

const meta: Meta = {
  title: 'Components/common/Nom',
  component: Nom,
}
export default meta

export const Default: Story = () => <Nom />
export const Lowercase: Story = () => <Nom nom="nom minuscule" />
export const AlreadyUppercase: Story = () => <Nom nom="Nom minuscule" />
