import { Meta, StoryFn } from '@storybook/vue3'
import { Bloc } from './bloc'

const meta: Meta = {
  title: 'Components/Etape/Bloc',
  component: Bloc,
}
export default meta

export const Complete: StoryFn = () => (
  <Bloc complete={true} step={{ name: 'Nom du step', help: null }}>
    <div>Coucou</div>
  </Bloc>
)
export const WithHelp: StoryFn = () => (
  <Bloc complete={true} step={{ name: 'Nom du step', help: 'Ceci est une aide' }}>
    <div>Coucou</div>
  </Bloc>
)
export const Incomplete: StoryFn = () => (
  <Bloc complete={false} step={{ name: 'Nom du step', help: 'Ceci est une aide' }}>
    <div>Coucou</div>
  </Bloc>
)
