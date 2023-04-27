import { Meta, StoryFn } from '@storybook/vue3'
import { Infos, Props } from './infos'
import { Section, TitreLink, TitreLinks } from 'camino-common/src/titres'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Titre/Infos',
  component: Infos,
}
export default meta

const titresTo: TitreLink[] = [{ id: 'id10', nom: 'Titre fils' }]
const titresFrom: TitreLink[] = [{ id: 'id11', nom: 'Titre père' }]

const apiClient: Props['apiClient'] = {
  loadLinkableTitres: () => () => Promise.resolve([]),
  loadTitreLinks: () => Promise.resolve({ aval: titresTo, amont: titresFrom }),
  linkTitres: () => new Promise<TitreLinks>(resolve => resolve({ aval: titresTo, amont: titresFrom })),
  loadTitreSections: (_titreId: string) =>
    new Promise<Section[]>(resolve =>
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
      id: 'fakeId',
      typeId: 'arm',
      contenu: { arm: { mecanisation: true } },
      titreStatutId: 'val',
      demarches: [
        {
          id: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2022-01-01'),
          typeId: 'oct',
        },
        {
          id: 'pro',
          demarcheDateDebut: toCaminoDate('2022-01-01'),
          demarcheDateFin: toCaminoDate('2025-01-01'),
          typeId: 'pro',
        },
      ],
      administrations: ['ope-onf-973-01'],
      titulaires: [
        {
          id: 'entreprise1',
          nom: 'Entreprise 1',
          legalSiren: 'Entreprise 1 Siren',
          operateur: true,
        },
        {
          id: 'entreprise2',
          nom: 'Entreprise 2',
          legalSiren: 'Entreprise 2 Siren',
          operateur: false,
        },
      ],
      amodiataires: [
        {
          id: 'entreprise3',
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
      id: 'fakeId',
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
      loadTitreSections: (_titreId: string) => new Promise<Section[]>(resolve => resolve([])),
    }}
  ></Infos>
)
