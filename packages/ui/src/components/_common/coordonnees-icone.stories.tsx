import { Meta, Story } from '@storybook/vue3'
import { CoordonneesIcone } from './coordonnees-icone'

const meta: Meta = {
  title: 'Components/Common/CoordonneesIcone',
  component: CoordonneesIcone,
}
export default meta

export const NoIcone: Story = () => (
  <div>
    <CoordonneesIcone />
  </div>
)
export const Icone: Story = () => <CoordonneesIcone coordonnees={'anything'} />
