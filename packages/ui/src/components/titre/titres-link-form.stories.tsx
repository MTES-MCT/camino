import { TitresLinkForm, Props } from './titres-link-form'
import { Meta, Story } from '@storybook/vue3'
import { TitreLink, TitreLinks } from 'camino-common/src/titres'
import { LinkableTitre } from '@/components/titre/titres-link-form-api-client'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Titre/TitresLinkForm',
  component: TitresLinkForm,
  argTypes: {},
}
export default meta

const linkableTitres: LinkableTitre[] = [
  {
    id: 'id1',
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2016-10-28',
          dateFin: '2017-03-17',
        },
      },
    ],
  },
  {
    id: 'id2',
    nom: 'Affluent Crique Saint Bernard',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27',
        },
      },
    ],
  },
  {
    id: 'id3',
    nom: 'Nouveau titre',
    titreStatutId: 'ech',
    demarches: [
      {
        phase: {
          dateDebut: '2008-11-30',
          dateFin: '2019-02-27',
        },
      },
    ],
  },
]

const titresTo: TitreLink[] = [{ id: 'id10', nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [linkableTitres[0]]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve(linkableTitres),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () => new Promise<TitreLinks>(resolve => resolve({ aval: titresTo, amont: titresFrom })),
}

export const AxmWithAlreadySelectedTitre: Story = () => (
  <TitresLinkForm user={{ role: 'super', ...testBlankUser }} titre={{ typeId: 'axm', administrations: [], id: 'titreId', demarches: [] }} apiClient={apiClient} />
)

export const FusionWithAlreadySelectedTitre: Story = () => (
  <TitresLinkForm
    user={{ role: 'super', ...testBlankUser }}
    titre={{
      typeId: 'cxm',
      administrations: [],
      id: 'titreId',
      demarches: [{ typeId: 'fus' }],
    }}
    apiClient={apiClient}
  />
)

export const TitreWithTitreLinksLoading: Story = () => (
  <TitresLinkForm
    user={{ role: 'super', ...testBlankUser }}
    titre={{ typeId: 'axm', administrations: [], id: 'titreId', demarches: [] }}
    apiClient={{
      ...apiClient,
      loadTitreLinks: () => new Promise<TitreLinks>(() => ({})),
    }}
  />
)

export const DefautCantUpdateLinks: Story = () => (
  <TitresLinkForm user={{ role: 'defaut', ...testBlankUser }} titre={{ typeId: 'axm', administrations: [], id: 'titreId', demarches: [] }} apiClient={apiClient} />
)
