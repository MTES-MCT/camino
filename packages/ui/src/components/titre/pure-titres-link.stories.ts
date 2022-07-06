import TitresLink from './pure-titres-link.vue'
import { Meta, Story } from '@storybook/vue3'
import { TitreTypeId } from 'camino-common/src/titresTypes'
import { GetTitreFromChoices } from './pure-titres-link.type'

const meta: Meta = {
  title: 'Components/Titre/TitresLink',
  component: TitresLink,
  argTypes: {}
}
export default meta

type Props = {
  titreTypeId: TitreTypeId
  selectedTitreId: string | null
  getTitresFromChoices: GetTitreFromChoices
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
  titreTypeId: 'axm',
  selectedTitreId: null,
  getTitresFromChoices: () => Promise.resolve(titres)
}

export const AXMWithAlreadySelectedTitre = Template.bind({})
AXMWithAlreadySelectedTitre.args = {
  titreTypeId: 'axm',
  selectedTitreId: 'id1',
  getTitresFromChoices: () => Promise.resolve(titres)
}

export const PXM = Template.bind({})
PXM.args = {
  titreTypeId: 'pxm',
  selectedTitreId: null,
  getTitresFromChoices: () => Promise.resolve(titres)
}

export const PXMWithAlreadySelectedTitre = Template.bind({})
PXMWithAlreadySelectedTitre.args = {
  titreTypeId: 'pxm',
  selectedTitreId: 'id1',
  getTitresFromChoices: () => Promise.resolve(titres)
}

export const NeitherAXMNorPXM = Template.bind({})
NeitherAXMNorPXM.args = {
  titreTypeId: 'arm',
  selectedTitreId: null,
  getTitresFromChoices: () => Promise.resolve(titres)
}
