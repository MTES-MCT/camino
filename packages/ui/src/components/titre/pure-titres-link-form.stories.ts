import PureTitresLinkForm from './pure-titres-link-form.vue'
import { Meta, Story } from '@storybook/vue3'
import { User } from 'camino-common/src/roles'
import { TitreTypeId } from 'camino-common/src/titresTypes'
import { AdministrationId } from 'camino-common/src/administrations'
import {
  LinkTitres,
  LoadLinkableTitres,
  loadLinkedTitres,
  LoadLinkedTitres,
  TitreLink
} from '@/components/titre/pure-titres-link.type'
import { DemarcheTypeId } from 'camino-common/src/demarchesTypes'

const meta: Meta = {
  title: 'Components/Titre/PureTitresLinkForm',
  component: PureTitresLinkForm,
  argTypes: {}
}
export default meta

type Props = {
  user: User
  titre: {
    id: string
    typeId: TitreTypeId
    administrations: { id: AdministrationId }[]
    demarches: { typeId: DemarcheTypeId }[]
  }
  loadLinkedTitres: LoadLinkedTitres
  loadLinkableTitres: LoadLinkableTitres
  linkTitres: LinkTitres
}
const Template: Story<Props> = (args: Props) => ({
  components: { PureTitresLinkForm },
  setup() {
    return { args }
  },
  template: '<PureTitresLinkForm v-bind="args" />'
})
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

const linkTitres = () => new Promise<void>(resolve => setTimeout(resolve, 1000))

export const AxmWithAlreadySelectedTitre = Template.bind({})
AxmWithAlreadySelectedTitre.args = {
  user: { role: 'super', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  loadLinkableTitres: () => Promise.resolve(titres),
  loadLinkedTitres: () => Promise.resolve([titres[0]]),
  linkTitres
}

export const CxmWithAlreadySelectedTitre = Template.bind({})
CxmWithAlreadySelectedTitre.args = {
  user: { role: 'super', administrationId: undefined },
  titre: { typeId: 'cxm', administrations: [], id: 'titreId', demarches: [] },
  loadLinkableTitres: () => Promise.resolve(titres),
  loadLinkedTitres: () => Promise.resolve(titres),
  linkTitres
}

export const TitreWithTitreLinksLoading = Template.bind({})
TitreWithTitreLinksLoading.args = {
  user: { role: 'super', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  loadLinkableTitres: () => Promise.resolve(titres),
  loadLinkedTitres: () => new Promise<TitreLink[]>(() => ({})),
  linkTitres
}

export const DefautCantUpdateLinks = Template.bind({})
DefautCantUpdateLinks.args = {
  user: { role: 'defaut', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  loadLinkableTitres: () => Promise.resolve(titres),
  loadLinkedTitres: () => Promise.resolve(titres),
  linkTitres
}
