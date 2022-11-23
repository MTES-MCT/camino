import Preview from './preview.vue'
import { Meta, Story } from '@storybook/vue3'
import { Activite } from './preview.types'
import { toCaminoDate } from 'camino-common/src/date'
const meta: Meta = {
  title: 'Components/Activite/Preview',
  component: Preview
}
export default meta

type Props = {
  activite: Activite
  route: string
  initialOpened: boolean
}

const Template: Story<Props> = (args: Props) => ({
  components: { Preview },
  setup() {
    return { args }
  },
  template: '<Preview v-bind="args" />'
})

const activite: Activite = {
  suppression: false,
  modification: false,
  date: toCaminoDate('2022-01-01'),
  dateSaisie: toCaminoDate('2022-01-01'),
  id: 'id',
  type: {
    id: 'gra',
    nom: 'Gra',
    frequenceId: 'ann',
    description: 'description du type'
  },
  statut: {
    id: 'fer',
    nom: 'Fermée',
    couleur: 'error'
  },
  deposable: false,
  annee: 2022,
  periodeId: 1,
  documents: [],
  sections: [],
  contenu: {}
}

export const OuvertParDefaut = Template.bind(
  {},
  {
    activite,
    route: 'fakeRoute',
    initialOpened: true
  }
)

export const FermeParDefaut = Template.bind(
  {},
  {
    activite,
    route: 'fakeRoute',
    initialOpened: false
  }
)

export const AideVisible = Template.bind(
  {},
  {
    activite: {
      ...activite,
      deposable: true,
      modification: true,
      statut: { id: 'enc', nom: 'En construction', couleur: 'info' }
    },
    route: 'fakeRoute',
    initialOpened: false
  }
)

export const ACompleter = Template.bind(
  {},
  {
    activite: {
      ...activite,
      deposable: false,
      modification: true,
      statut: { id: 'enc', nom: 'En construction', couleur: 'info' }
    },
    route: 'fakeRoute',
    initialOpened: false
  }
)

export const Supprimable = Template.bind(
  {},
  {
    activite: {
      ...activite,
      suppression: true,
      deposable: false,
      modification: true,
      statut: { id: 'enc', nom: 'En construction', couleur: 'info' }
    },
    route: 'fakeRoute',
    initialOpened: false
  }
)
