import SectionElement from './section-element.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/common/OldSectionElement',
  component: SectionElement,
  argTypes: {},
}
export default meta

type Props = {
  element: {
    id: string
    type: 'file' | string
    nom: string
    description: string
  }
  contenu: Record<string, any>
}

const Template: Story<Props> = (args: Props) => ({
  components: { SectionElement },
  setup() {
    return { args }
  },
  template: '<SectionElement v-bind="args" />',
})

export const Default = Template.bind({})
Default.args = {
  element: {
    id: 'id',
    type: 'type',
    nom: "nom de l'élément",
    description: 'description',
  },
  contenu: {},
}

export const AucunFichier = Template.bind({})
AucunFichier.args = {
  element: {
    id: 'id',
    type: 'file',
    nom: "nom de l'élément",
    description: 'description',
  },
  contenu: {},
}

export const UnFichier = Template.bind({})
UnFichier.args = {
  element: {
    id: 'id',
    type: 'file',
    nom: "nom de l'élément",
    description: 'description',
  },
  contenu: { id: '     nom du fichier' },
}
