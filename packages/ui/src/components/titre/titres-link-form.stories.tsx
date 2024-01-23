import { TitresLinkForm, Props } from './titres-link-form'
import { Meta, StoryFn } from '@storybook/vue3'
import { TitreLink, TitreLinks } from 'camino-common/src/titres'
import { LinkableTitre } from '@/components/titre/titres-link-form-api-client'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCaminoDate } from 'camino-common/src/date'
import { vueRouter } from 'storybook-vue3-router'
import { titreIdValidator } from 'camino-common/src/validators/titres'

const meta: Meta = {
  title: 'Components/Titre/TitresLinkForm',
  component: TitresLinkForm,
  argTypes: {},
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' }), vueRouter([{ name: 'titre' }])],
}
export default meta

const linkableTitres: LinkableTitre[] = [
  {
    id: titreIdValidator.parse('id1'),
    nom: 'Abttis Coucou',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2016-10-28'),
        demarcheDateFin: toCaminoDate('2017-03-17'),
      },
    ],
  },
  {
    id: titreIdValidator.parse('id2'),
    nom: 'Affluent Crique Saint Bernard',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
  {
    id: titreIdValidator.parse('id3'),
    nom: 'Nouveau titre',
    titreStatutId: 'ech',
    demarches: [
      {
        demarcheDateDebut: toCaminoDate('2008-11-30'),
        demarcheDateFin: toCaminoDate('2019-02-27'),
      },
    ],
  },
]

const titresTo: TitreLink[] = [{ id: titreIdValidator.parse('id10'), nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [linkableTitres[0]]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve(linkableTitres),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () => new Promise<TitreLinks>(resolve => resolve({ aval: titresTo, amont: titresFrom })),
}

export const AxmWithAlreadySelectedTitre: StoryFn = () => (
  <TitresLinkForm user={{ role: 'super', ...testBlankUser }} titre={{ typeId: 'axm', administrations: [], id: titreIdValidator.parse('titreId'), demarches: [] }} apiClient={apiClient} />
)

export const FusionWithAlreadySelectedTitre: StoryFn = () => (
  <TitresLinkForm
    user={{ role: 'super', ...testBlankUser }}
    titre={{
      typeId: 'cxm',
      administrations: [],
      id: titreIdValidator.parse('titreId'),
      demarches: [{ demarche_type_id: 'fus' }],
    }}
    apiClient={{
      ...apiClient,
      loadTitreLinks: () => {
        return Promise.resolve({
          aval: [
            { id: titreIdValidator.parse('id10'), nom: 'Titre fils' },
            { id: titreIdValidator.parse('id11'), nom: 'Titre fils 2' },
          ],
          amont: titresFrom,
        })
      },
    }}
  />
)

export const TitreWithTitreLinksLoading: StoryFn = () => (
  <TitresLinkForm
    user={{ role: 'super', ...testBlankUser }}
    titre={{ typeId: 'axm', administrations: [], id: titreIdValidator.parse('titreId'), demarches: [] }}
    apiClient={{
      ...apiClient,
      loadTitreLinks: () => new Promise<TitreLinks>(() => ({})),
    }}
  />
)

export const DefautCantUpdateLinks: StoryFn = () => (
  <TitresLinkForm user={{ role: 'defaut', ...testBlankUser }} titre={{ typeId: 'axm', administrations: [], id: titreIdValidator.parse('titreId'), demarches: [] }} apiClient={apiClient} />
)
