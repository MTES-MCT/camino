import { action } from '@storybook/addon-actions'
import { Navigation } from './navigation'
import { Meta, StoryFn } from '@storybook/vue3'
import { Router } from 'vue-router'

const meta: Meta = {
  title: 'Components/Ui/Navigation',
  component: Navigation,
  argTypes: {
    color: String,
  },
}
export default meta

const routerAction = {
  push: action('pushed'),
} as Router
export const Default: StoryFn = () => <Navigation class="btn btn-primary" title="titre de la navigation" render={() => <>Contenu du lien</>} router={routerAction} to={{ name: 'location' }} />
