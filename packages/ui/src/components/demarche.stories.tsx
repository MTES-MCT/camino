import { vueRouter } from 'storybook-vue3-router'
import { PureDemarche } from './demarche'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { DemarcheGet, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { titreSlugValidator } from 'camino-common/src/titres'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { Router } from 'vue-router'
import { ApiClient } from '@/api/api-client'
import { dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'

const meta: Meta = {
  title: 'Components/DemarcheNoStoryshots',
  // @ts-ignore en attente du support par @storybook/vue3
  component: PureDemarche,
  decorators: [vueRouter([{ name: 'titre' }, { name: 'demarche' }, { name: 'entreprise' }])],
}
export default meta

// FIXME ajouter un test avec des voisins sur la carte
const getDemarcheAction = action('getDemarcheAction')
const getTitresWithPerimetreForCarteAction = action('getTitresWithPerimetreForCarteAction')
const routerPushAction = action('routerPushAction')

const date = toCaminoDate('2023-10-24')

const routerPushMock: Pick<Router, 'push'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
}
const demarche: DemarcheGet = {
  id: demarcheIdValidator.parse('demarcheId'),
  demarche_type_id: 'oct',
  demarche_statut_id: 'acc',
  titre: {
    nom: 'Nom du titre',
    slug: titreSlugValidator.parse('slug-du-titre'),
    titre_type_id: 'arm',
    phases: [
      { slug: demarcheSlugValidator.parse('slug-demarche'), demarche_type_id: 'oct', demarche_date_debut: null, demarche_date_fin: null },
      { slug: demarcheSlugValidator.parse('slug-demarche2'), demarche_type_id: 'amo', demarche_date_debut: null, demarche_date_fin: null },
    ],
  },
  contenu: { mécanisation: 'oui' },
  slug: demarcheSlugValidator.parse('slug-demarche'),
  communes: [
    { id: communeIdValidator.parse('09239'), nom: 'Quérigut' },
    { id: communeIdValidator.parse('14266'), nom: 'Feuguerolles-Bully' },
  ],
  secteurs_maritimes: ['Baie de Seine', 'Balagne'],
  substances: ['auru', 'arge'],
  titulaires: [
    { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', operateur: false },
    { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2', operateur: true },
  ],

  amodiataires: [
    { id: entrepriseIdValidator.parse('amodiataire1'), nom: 'amodiataire1', operateur: false },
    { id: entrepriseIdValidator.parse('amodiataire2'), nom: 'amodiataire2', operateur: true },
  ],

  geojsonMultiPolygon: {
    properties: null,
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-53.58181013905019, 3.8309654861273],
            [-53.58178306390299, 3.8219278216269807],
            [-53.572785590706495, 3.82195493825841],
            [-53.57281257175149, 3.8309926670647294],
            [-53.58181013905019, 3.8309654861273],
          ],
        ],
        [
          [
            [-53.60031408473134, 3.8224780986447566],
            [-53.59891645305842, 3.8181831495446303],
            [-53.58181205656814, 3.82379854768971],
            [-53.58320964990986, 3.828093576227541],
            [-53.60031408473134, 3.8224780986447566],
          ],
        ],
        [
          [
            [-53.583861926103765, 3.8502114455117433],
            [-53.592379712320195, 3.834289122043602],
            [-53.588417035915334, 3.8321501920354253],
            [-53.57989914401643, 3.8480725119510217],
            [-53.583861926103765, 3.8502114455117433],
          ],
        ],
      ],
    },
  },
  etapes: [
    {
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      date,
      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaires: [
          { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', operateur: false },
          { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2', operateur: true },
        ],

        amodiataires: [{ id: entrepriseIdValidator.parse('amodiataire1'), nom: 'Amodiataire 1', operateur: false }],
        geojsonMultiPolygon: {
          properties: null,
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [-53.58181013905019, 3.8309654861273],
                  [-53.58178306390299, 3.8219278216269807],
                  [-53.572785590706495, 3.82195493825841],
                  [-53.57281257175149, 3.8309926670647294],
                  [-53.58181013905019, 3.8309654861273],
                ],
              ],
            ],
          },
        },

        surface: 10,
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }],
    },
    {
      etape_type_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeStatutId,
      date: dateAddDays(date, 10),

      sections_with_values: [],
    },
    {
      etape_type_id: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE.etapeStatutId,
      date: dateAddDays(date, 20),

      sections_with_values: [],
    },
  ],
}

const apiClient: Pick<ApiClient, 'getDemarche' | 'getTitresWithPerimetreForCarte'> = {
  getTitresWithPerimetreForCarte: params => {
    getTitresWithPerimetreForCarteAction(params)

    return Promise.resolve({ elements: [], total: 0 })
  },
  getDemarche: demarcheIdOrSlug => {
    getDemarcheAction(demarcheIdOrSlug)

    return Promise.resolve(demarche)
  },
}

export const FullNoSnapshot: StoryFn = () => <PureDemarche user={{ ...testBlankUser, role: 'super' }} router={routerPushMock} apiClient={apiClient} demarcheId={demarche.id} />
export const FullSingularNoSnapshot: StoryFn = () => (
  <PureDemarche
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={{
      ...apiClient,
      getDemarche: demarcheIdOrSlug => {
        getDemarcheAction(demarcheIdOrSlug)

        return Promise.resolve({
          id: demarcheIdValidator.parse('demarcheId'),
          demarche_type_id: 'oct',
          demarche_statut_id: 'acc',
          titre: {
            nom: 'Nom du titre',
            slug: titreSlugValidator.parse('slug-du-titre'),
            titre_type_id: 'arm',
            phases: [],
          },
          contenu: {},
          slug: demarcheSlugValidator.parse('slug-demarche'),
          communes: [{ id: communeIdValidator.parse('09239'), nom: 'Quérigut' }],
          secteurs_maritimes: ['Baie de Seine'],
          substances: ['auru'],
          titulaires: [{ id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', operateur: false }],
          amodiataires: [{ id: entrepriseIdValidator.parse('amodiataire1'), nom: 'amodiataire1', operateur: false }],
          geojsonMultiPolygon: {
            properties: null,
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-53.58181013905019, 3.8309654861273],
                    [-53.58178306390299, 3.8219278216269807],
                    [-53.572785590706495, 3.82195493825841],
                    [-53.57281257175149, 3.8309926670647294],
                    [-53.58181013905019, 3.8309654861273],
                  ],
                ],
                [
                  [
                    [-53.60031408473134, 3.8224780986447566],
                    [-53.59891645305842, 3.8181831495446303],
                    [-53.58181205656814, 3.82379854768971],
                    [-53.58320964990986, 3.828093576227541],
                    [-53.60031408473134, 3.8224780986447566],
                  ],
                ],
                [
                  [
                    [-53.583861926103765, 3.8502114455117433],
                    [-53.592379712320195, 3.834289122043602],
                    [-53.588417035915334, 3.8321501920354253],
                    [-53.57989914401643, 3.8480725119510217],
                    [-53.583861926103765, 3.8502114455117433],
                  ],
                ],
              ],
            },
          },
          etapes: [],
        })
      },
    }}
    demarcheId={demarche.id}
  />
)
export const EmptyNoSnapshot: StoryFn = () => (
  <PureDemarche
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={{
      ...apiClient,
      getDemarche: demarcheIdOrSlug => {
        getDemarcheAction(demarcheIdOrSlug)

        return Promise.resolve({
          id: demarcheIdValidator.parse('demarcheId'),
          demarche_type_id: 'oct',
          demarche_statut_id: 'acc',
          titre: {
            nom: 'Nom du titre',
            slug: titreSlugValidator.parse('slug-du-titre'),
            titre_type_id: 'arm',
            phases: [],
          },
          contenu: {},
          slug: demarcheSlugValidator.parse('slug-demarche'),
          communes: [],
          secteurs_maritimes: [],
          substances: [],
          titulaires: [],
          amodiataires: [],
          geojsonMultiPolygon: {
            properties: null,
            type: 'Feature',
            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-53.58181013905019, 3.8309654861273],
                    [-53.58178306390299, 3.8219278216269807],
                    [-53.572785590706495, 3.82195493825841],
                    [-53.57281257175149, 3.8309926670647294],
                    [-53.58181013905019, 3.8309654861273],
                  ],
                ],
                [
                  [
                    [-53.60031408473134, 3.8224780986447566],
                    [-53.59891645305842, 3.8181831495446303],
                    [-53.58181205656814, 3.82379854768971],
                    [-53.58320964990986, 3.828093576227541],
                    [-53.60031408473134, 3.8224780986447566],
                  ],
                ],
                [
                  [
                    [-53.583861926103765, 3.8502114455117433],
                    [-53.592379712320195, 3.834289122043602],
                    [-53.588417035915334, 3.8321501920354253],
                    [-53.57989914401643, 3.8480725119510217],
                    [-53.583861926103765, 3.8502114455117433],
                  ],
                ],
              ],
            },
          },
          etapes: [],
        })
      },
    }}
    demarcheId={demarche.id}
  />
)
