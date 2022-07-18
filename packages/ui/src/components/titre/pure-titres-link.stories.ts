import TitresLink from './pure-titres-link.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  LoadLinkableTitres,
  TitreLink,
  TitresLinkConfig
} from './pure-titres-link.type'
import { TitreTypeId } from 'camino-common/src/titresTypes'

const meta: Meta = {
  title: 'Components/Titre/TitresLink',
  component: TitresLink,
  argTypes: {}
}
export default meta

type Props = {
  config: TitresLinkConfig
  titreTypeId: TitreTypeId
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
  config: { type: 'single', selectedTitreId: null },
  titreTypeId: 'axm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const AXMWithAlreadySelectedTitre = Template.bind({})
AXMWithAlreadySelectedTitre.args = {
  config: { type: 'single', selectedTitreId: 'id1' },
  titreTypeId: 'axm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const PXM = Template.bind({})
PXM.args = {
  config: { type: 'single', selectedTitreId: null },
  titreTypeId: 'pxm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const PXMWithAlreadySelectedTitre = Template.bind({})
PXMWithAlreadySelectedTitre.args = {
  config: { type: 'single', selectedTitreId: 'id1' },
  titreTypeId: 'pxm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const NeitherAXMNorPXM = Template.bind({})
NeitherAXMNorPXM.args = {
  config: { type: 'single', selectedTitreId: 'id1' },
  titreTypeId: 'arm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusion = Template.bind({})
DemarcheFusion.args = {
  config: {
    type: 'multiple',
    selectedTitreIds: []
  },
  titreTypeId: 'pxm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const DemarcheFusionWithAlreadySelectedTitre = Template.bind({})
DemarcheFusionWithAlreadySelectedTitre.args = {
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1', 'id2']
  },
  titreTypeId: 'pxm',
  loadLinkableTitres: () => Promise.resolve(titres)
}

export const Loading = Template.bind({})
Loading.args = {
  loadLinkableTitres: () => new Promise<TitreLink[]>(resolve => {}),
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1']
  },
  titreTypeId: 'pxm'
}
export const WithError = Template.bind({})
WithError.args = {
  loadLinkableTitres: () => Promise.reject(new Error('because reasons')),
  config: {
    type: 'multiple',
    selectedTitreIds: ['id1']
  },
  titreTypeId: 'pxm'
}
