import PureTitresLinkForm from './pure-titres-link-form.vue'
import { Meta, Story } from '@storybook/vue3'
import { User } from 'camino-common/src/roles'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreLink, TitreLinks } from 'camino-common/src/titres'
import { ApiClient } from '@/api/api-client'
import { LinkableTitre } from '@/components/titre/pure-titres-link-form-api-client'

const meta: Meta = {
  title: 'Components/Titre/TitresLinkForm',
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

  apiClient: Pick<
    ApiClient,
    'loadTitreLinks' | 'loadLinkableTitres' | 'linkTitres'
  >
}
const Template: Story<Props> = (args: Props) => ({
  components: { PureTitresLinkForm },
  setup() {
    return { args }
  },
  template: '<PureTitresLinkForm v-bind="args" />'
})
const linkableTitres: LinkableTitre[] = [
  {
    id: 'id1',
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
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
    titreStatutId: 'ech',
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
    titreStatutId: 'ech',
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

const titresTo: TitreLink[] = [{ id: 'id10', nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [linkableTitres[0]]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve(linkableTitres),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () =>
    new Promise<TitreLinks>(resolve =>
      resolve({ aval: titresTo, amont: titresFrom })
    )
}

export const AxmWithAlreadySelectedTitre = Template.bind({})
AxmWithAlreadySelectedTitre.args = {
  user: { role: 'super', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  apiClient
}

export const FusionWithAlreadySelectedTitre = Template.bind({})
FusionWithAlreadySelectedTitre.args = {
  user: { role: 'super', administrationId: undefined },
  titre: {
    typeId: 'cxm',
    administrations: [],
    id: 'titreId',
    demarches: [{ typeId: 'fus' }]
  },
  apiClient
}

export const TitreWithTitreLinksLoading = Template.bind({})
TitreWithTitreLinksLoading.args = {
  user: { role: 'super', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  apiClient: {
    ...apiClient,
    loadTitreLinks: () => new Promise<TitreLinks>(() => ({}))
  }
}

export const DefautCantUpdateLinks = Template.bind({})
DefautCantUpdateLinks.args = {
  user: { role: 'defaut', administrationId: undefined },
  titre: { typeId: 'axm', administrations: [], id: 'titreId', demarches: [] },
  apiClient
}
