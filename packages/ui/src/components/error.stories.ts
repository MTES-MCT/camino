import Error from './error.vue'
import { Meta, Story } from '@storybook/vue3'
import { Couleur } from 'camino-common/src/static/couleurs'

const meta: Meta = {
  title: 'Page/Error',
  component: Error,
  argTypes: {}
}
export default meta

type Props = { couleur: Couleur; message: string }

const Template: Story<Props> = (args: Props) => ({
  components: { Error },
  setup() {
    return { args }
  },
  template: '<Error v-bind="args" />'
})

export const Success = Template.bind(
  {},
  { couleur: 'success', message: 'Bravo c’est un succès' }
)
export const Info = Template.bind(
  {},
  { couleur: 'info', message: 'Message à caractère informatif' }
)
export const Warning = Template.bind(
  {},
  { couleur: 'warning', message: 'Attention danger' }
)
export const Erreur = Template.bind(
  {},
  { couleur: 'error', message: 'Erreur, c’est cassé.' }
)
