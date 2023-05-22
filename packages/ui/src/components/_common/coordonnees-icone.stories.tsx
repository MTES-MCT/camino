import { Meta, StoryFn } from '@storybook/vue3'
import { CoordonneesIcone } from './coordonnees-icone'

const meta: Meta = {
  title: 'Components/Common/CoordonneesIcone',
  component: CoordonneesIcone,
}
export default meta

export const NoIcone: StoryFn = () => (
  <div>
    <CoordonneesIcone />
  </div>
)
export const Icone: StoryFn = () => <CoordonneesIcone coordonnees={'anything'} />
