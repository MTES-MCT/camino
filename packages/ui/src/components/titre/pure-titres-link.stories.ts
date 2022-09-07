import TitresLink from './pure-titres-link.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  LinkableTitre,
  LoadLinkableTitres,
  TitresLinkConfig
} from './pure-titres-link.type'

const meta: Meta = {
  title: 'Components/Titre/TitresLink',
  component: TitresLink,
  argTypes: {}
}
export default meta

type Props = {
  config: TitresLinkConfig
  loadLinkableTitres: LoadLinkableTitres
}
const titres: LinkableTitre[] = [
  {
    id: 'id1',
    nom: 'Abttis Coucou',
    statutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2016-10-28',
          dateFin: '2017-03-17'
        }
      }
    ]
  },
  {
    id: 'id2',
    nom: 'Affluent Crique Saint Bernard',
    statutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27'
        }
      }
    ]
  },
  {
    id: 'id3',
    nom: 'Nouveau titre',
    statutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27'
        }
      }
    ]
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { TitresLink },
  setup() {
    return { args }
  },
  template: '<TitresLink v-bind="args" />'
})

export const AXM = Template.bind({})
AXM.args = {
  config: { type: 'single', selectedTitreId: null },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const AXMWithAlreadySelectedTitre = Template.bind({})
AXMWithAlreadySelectedTitre.args = {
  config: { type: 'single', selectedTitreId: 'id1' },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusion = Template.bind({})
DemarcheFusion.args = {
  config: {
    type: 'multiple',
    selectedTitreIds: []
  },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusionWithAlreadySelectedTitre = Template.bind({})
DemarcheFusionWithAlreadySelectedTitre.args = {
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1', 'id2']
  },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const Loading = Template.bind({})
Loading.args = {
  loadLinkableTitres: () => new Promise<LinkableTitre[]>(resolve => {}),
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1']
  }
}
export const WithError = Template.bind({})
WithError.args = {
  loadLinkableTitres: () => Promise.reject(new Error('because reasons')),
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1']
  }
}
