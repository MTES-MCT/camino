import PureFormSaveBtn from './pure-form-save-btn.vue'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Etape/FormSaveBtn',
  component: PureFormSaveBtn,
  argTypes: {},
}
export default meta

type Props = {
  alertes?: { message: string; url: string }[]
  canSave: boolean
  canDepose: boolean
  showDepose: boolean
}
const Template: StoryFn<Props> = (args: Props) => ({
  components: { PureFormSaveBtn },
  setup() {
    return { args }
  },
  template: '<PureFormSaveBtn v-bind="args" @save="onSave" @depose="onDepose" />',
  methods: {
    onSave: action('save'),
    onDepose: action('depose'),
  },
})

export const DemandeEnConstructionIncomplete = Template.bind({})
DemandeEnConstructionIncomplete.args = {
  canSave: true,
  showDepose: true,
  canDepose: false,
  alertes: [{ message: 'alerte', url: 'google.com' }],
}

export const DemandeEnConstructionComplete = Template.bind({})
DemandeEnConstructionComplete.args = {
  canSave: true,
  showDepose: true,
  canDepose: true,
  alertes: [{ message: 'alerte', url: 'google.com' }],
}

export const CompletudeDeLaDemandeImcomplete = Template.bind({})
CompletudeDeLaDemandeImcomplete.args = {
  canSave: false,
  showDepose: false,
  canDepose: true,
  alertes: [{ message: 'alerte', url: 'google.com' }],
}

export const CompletudeDeLaDemandeComplete = Template.bind({})
CompletudeDeLaDemandeComplete.args = {
  canSave: true,
  showDepose: false,
  canDepose: true,
  alertes: [{ message: 'alerte', url: 'google.com' }],
}

export const SansMessage = Template.bind({})
SansMessage.args = {
  canSave: true,
  showDepose: true,
  canDepose: true,
}
