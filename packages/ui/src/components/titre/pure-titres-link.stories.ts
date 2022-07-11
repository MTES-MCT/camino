import TitresLink from './pure-titres-link.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  LoadLinkableTitres,
  TitreLink,
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

const titres = [
  {
    id: 'id1',
    nom: 'Abttis Coucou',
    statut: {
      couleur: 'neutral',
      nom: 'échu'
    },
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
    statut: {
      couleur: 'neutral',
      nom: 'échu'
    },
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
    statut: {
      couleur: 'neutral',
      nom: 'échu'
    },
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
  config: { type: 'single', titreTypeId: 'axm', selectedTitreId: null },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const AXMWithAlreadySelectedTitre = Template.bind({})
AXMWithAlreadySelectedTitre.args = {
  config: { type: 'single', titreTypeId: 'axm', selectedTitreId: 'id1' },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const PXM = Template.bind({})
PXM.args = {
  config: { type: 'single', titreTypeId: 'pxm', selectedTitreId: null },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const PXMWithAlreadySelectedTitre = Template.bind({})
PXMWithAlreadySelectedTitre.args = {
  config: { type: 'single', titreTypeId: 'pxm', selectedTitreId: 'id1' },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const NeitherAXMNorPXM = Template.bind({})
NeitherAXMNorPXM.args = {
  config: { type: 'single', titreTypeId: 'arm', selectedTitreId: 'id1' },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusion = Template.bind({})
DemarcheFusion.args = {
  config: {
    type: 'multiple',
    titreTypeId: 'pxm',
    demarcheTypeId: 'fus',
    selectedTitreIds: []
  },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusionWithAlreadySelectedTitre = Template.bind({})
DemarcheFusionWithAlreadySelectedTitre.args = {
  config: {
    type: 'multiple',
    titreTypeId: 'pxm',
    demarcheTypeId: 'fus',
    selectedTitreIds: ['id1', 'id2']
  },
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const Loading = Template.bind({})
Loading.args = {
  loadLinkableTitres: () => new Promise<TitreLink[]>(resolve => {}),
  config: {
    type: 'multiple',
    titreTypeId: 'pxm',
    demarcheTypeId: 'fus',
    selectedTitreIds: ['id1']
  }
}
export const WithError = Template.bind({})
WithError.args = {
  loadLinkableTitres: () => Promise.reject(new Error('because reasons')),
  config: {
    type: 'multiple',
    titreTypeId: 'pxm',
    demarcheTypeId: 'fus',
    selectedTitreIds: ['id1']
  }
}
