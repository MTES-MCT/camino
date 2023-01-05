import Preview from './preview.vue'
import { Meta, Story } from '@storybook/vue3'
import { Activite } from './preview.types'
import { toCaminoDate } from 'camino-common/src/date'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'

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
  activiteStatutId: ACTIVITES_STATUTS_IDS.CLOTURE,
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
      activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
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
      activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
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
      activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION
    },
    route: 'fakeRoute',
    initialOpened: false
  }
)
