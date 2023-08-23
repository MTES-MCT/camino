import { Navigation } from './navigation'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Ui/Navigation',
  component: Navigation,
  argTypes: {
    color: String,
  },
}
export default meta

export const Default: StoryFn = () => <Navigation class="btn btn-primary" title="titre de la navigation" render={() => <>Contenu du lien</>} to="/a-propos" />
