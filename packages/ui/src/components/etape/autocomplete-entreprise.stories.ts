import AutoCompleteEntrepriseComponent from './autocomplete-entreprise.vue'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { AutoCompleteEntreprise } from '@/components/etape/autocomplete-entreprise.type'

const meta: Meta = {
  title: 'Components/Etape/AutoCompleteEntreprise',
  component: AutoCompleteEntrepriseComponent,
  argTypes: {}
}
export default meta

type Props = {
  nonSelectableEntities: AutoCompleteEntreprise[]
  selectedEntities: AutoCompleteEntreprise[]
  allEntities: AutoCompleteEntreprise[]
  placeholder: string
}
const Template: Story<Props> = (args: Props) => ({
  components: { AutoCompleteEntrepriseComponent },
  setup() {
    return { args }
  },
  template:
    '<AutoCompleteEntrepriseComponent v-bind="args" @onEntreprisesUpdate="onEntreprisesUpdate" />',
  methods: {
    onEntreprisesUpdate: action('onEntreprisesUpdate')
  }
})

export const Default = Template.bind({})
Default.args = {
  placeholder: 'placeholder',
  allEntities: [{ id: 'optionId1', nom: 'optionNom1', operateur: false }]
}
export const WithEntitiesAlreadyPresent = Template.bind({})
WithEntitiesAlreadyPresent.args = {
  placeholder: 'placeholder',
  selectedEntities: [
    { id: 'optionId10', nom: 'optionNom10', operateur: false },
    { id: 'optionId2', nom: 'optionNom2', operateur: true }
  ],
  allEntities: [
    { id: 'optionId1', nom: 'optionNom1', operateur: false },
    { id: 'optionId2', nom: 'optionNom2', operateur: false },
    { id: 'optionId3', nom: 'optionNom3', operateur: false },
    { id: 'optionId4', nom: 'optionNom4', operateur: false },
    { id: 'optionId5', nom: 'optionNom5', operateur: false }
  ],
  nonSelectableEntities: [
    { id: 'optionId1', nom: 'optionNom1', operateur: false }
  ]
}
