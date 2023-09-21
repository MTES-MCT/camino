import { Meta, StoryFn } from '@storybook/vue3'
import { Infos, Props } from './infos'
import { TitreId, TitreLink, TitreLinks, titreIdValidator } from 'camino-common/src/titres'
import { SectionWithValue } from 'camino-common/src/sections'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCaminoDate } from 'camino-common/src/date'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Titre/Infos',
  component: Infos,
  decorators: [vueRouter([{ name: 'titre' }])],
}
export default meta

const titresTo: TitreLink[] = [{ id: titreIdValidator.parse('id10'), nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [{ id: titreIdValidator.parse('id11'), nom: 'Titre père' }]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve([]),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () => new Promise<TitreLinks>(resolve => resolve({ aval: titresTo, amont: titresFrom })),
  loadTitreSections: (_titreId: TitreId) =>
    new Promise<SectionWithValue[]>(resolve =>
      resolve([
        {
          id: 'id',
          nom: 'Nom de section',
          elements: [
            { id: 'element', nom: 'element', type: 'radio', value: true },
            {
              id: 'element2',
              nom: 'Second élément',
              description: 'avec description',
              type: 'radio',
              value: true,
            },
          ],
        },
      ])
    ),
}

export const Default: StoryFn = () => (
  <Infos
    currentDay={toCaminoDate('2023-04-06')}
    titre={{
      id: titreIdValidator.parse('fakeId'),
      typeId: 'arm',
      contenu: { arm: { mecanisation: true } },
      titreStatutId: 'val',
      demarches: [
        {
          id: demarcheIdValidator.parse('oct'),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2022-01-01'),
          typeId: 'oct',
        },
        {
          id: demarcheIdValidator.parse('pro'),
          demarcheDateDebut: toCaminoDate('2022-01-01'),
          demarcheDateFin: toCaminoDate('2025-01-01'),
          typeId: 'pro',
        },
      ],
      administrations: ['ope-onf-973-01'],
      titulaires: [
        {
          id: entrepriseIdValidator.parse('entreprise1'),
          nom: 'Entreprise 1',
          legalSiren: 'Entreprise 1 Siren',
          operateur: true,
        },
        {
          id: entrepriseIdValidator.parse('entreprise2'),
          nom: 'Entreprise 2',
          legalSiren: 'Entreprise 2 Siren',
          operateur: false,
        },
      ],
      amodiataires: [
        {
          id: entrepriseIdValidator.parse('entreprise3'),
          nom: 'Entreprise 3',
          legalSiren: 'Entreprise 3 Siren',
          operateur: false,
        },
      ],
      substances: ['auru', 'scoc'],
      references: [{ nom: '2023/01', referenceTypeId: 'ifr' }],
    }}
    user={{ role: 'super', ...testBlankUser }}
    apiClient={apiClient}
  ></Infos>
)

export const Empty: StoryFn = () => (
  <Infos
    currentDay={toCaminoDate('2023-04-06')}
    titre={{
      id: titreIdValidator.parse('fakeId'),
      typeId: 'arm',
      contenu: {},
      titreStatutId: 'dmi',
      demarches: [],
      administrations: [],
      titulaires: [],
      amodiataires: [],
      substances: [],
      references: [],
    }}
    user={{ role: 'super', ...testBlankUser }}
    apiClient={{
      loadLinkableTitres: () => () => Promise.resolve([]),
      loadTitreLinks: () => Promise.resolve({ aval: [], amont: [] }),
      linkTitres: () => new Promise<TitreLinks>(resolve => resolve({ aval: [], amont: [] })),
      loadTitreSections: (_titreId: string) => new Promise<SectionWithValue[]>(resolve => resolve([])),
    }}
  ></Infos>
)
