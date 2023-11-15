import { vueRouter } from 'storybook-vue3-router'
import { PureDemarche } from './demarche'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { DemarcheGet, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/titres'
import { communeIdValidator } from 'camino-common/src/static/communes'
import { EtapeEntrepriseDocument, documentIdValidator, entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { Router } from 'vue-router'
import { ApiClient } from '@/api/api-client'
import { dateAddDays, toCaminoDate } from 'camino-common/src/date'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { EtapeDocument, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { MapPattern } from './_map/pattern'

const meta: Meta = {
  title: 'Components/DemarcheNoStoryshots',
  // @ts-ignore en attente du support par @storybook/vue3
  component: PureDemarche,
  decorators: [vueRouter([{ name: 'titre' }, { name: 'demarche' }, { name: 'entreprise' }])],
}
export default meta

const getDemarcheAction = action('getDemarcheAction')
const deleteEtapeAction = action('deleteEtapeAction')
const deposerEtapeAction = action('deposerEtapeAction')
const getTitresWithPerimetreForCarteAction = action('getTitresWithPerimetreForCarteAction')
const routerPushAction = action('routerPushAction')
const routerReplaceAction = action('routerReplaceAction')
const date = toCaminoDate('2023-10-24')

const routerPushMock: Pick<Router, 'push' | 'replace'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
  replace: to => {
    routerReplaceAction(to)

    return Promise.resolve()
  },
}

const documents: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    document_type_id: 'atf',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'bil',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
]

const entrepriseDocuments: EtapeEntrepriseDocument[] = [
  {
    id: entrepriseDocumentIdValidator.parse('id'),
    date: toCaminoDate('2023-01-01'),
    entreprise_document_type_id: 'atf',
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: 'bil',
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
]

const demarche: DemarcheGet = {
  id: demarcheIdValidator.parse('demarcheId'),
  demarche_type_id: 'oct',
  demarche_statut_id: 'acc',
  titre: {
    nom: 'Nom du titre',
    slug: titreSlugValidator.parse('slug-du-titre'),
    titre_type_id: 'arm',
    titre_statut_id: 'val',
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
      id: etapeIdValidator.parse('etapeId1'),
      slug: etapeSlugValidator.parse('etape-slug-1'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      date,
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
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
      documents,
      entreprises_documents: entrepriseDocuments,
    },
    {
      id: etapeIdValidator.parse('etapeId2'),
      slug: etapeSlugValidator.parse('etape-slug-2'),
      etape_type_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeStatutId,
      date: dateAddDays(date, 10),

      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      sections_with_values: [],
      documents: [],
      entreprises_documents: [],
    },
    {
      id: etapeIdValidator.parse('etapeId3'),
      slug: etapeSlugValidator.parse('etape-slug-3'),
      etape_type_id: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.recevabiliteDeLaDemande.DEFAVORABLE.etapeStatutId,
      date: dateAddDays(date, 20),

      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      sections_with_values: [],
      documents: [],
      entreprises_documents: [],
    },
  ],
  sdom_zones: [],
}

const apiClient: Pick<ApiClient, 'getDemarche' | 'getTitresWithPerimetreForCarte' | 'deleteEtape' | 'deposeEtape'> = {
  getTitresWithPerimetreForCarte: params => {
    getTitresWithPerimetreForCarteAction(params)

    return Promise.resolve({
      elements: [
        {
          id: titreIdValidator.parse('id-du-titre-voisin'),
          nom: 'nom du titre',
          references: [],
          slug: titreSlugValidator.parse('slug-du-titre-voisin'),
          titreStatutId: TitresStatutIds.Valide,
          typeId: TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES,
          titulaires: [],
          geojsonMultiPolygon: {
            type: 'Feature',
            properties: {},

            geometry: {
              type: 'MultiPolygon',
              coordinates: [
                [
                  [
                    [-53.57, 3.84],
                    [-53.56, 3.81],
                    [-53.565, 3.8309926670647294],
                    [-53.57, 3.84],
                  ],
                ],
              ],
            },
          },
        },
      ],
      total: 1,
    })
  },
  getDemarche: demarcheIdOrSlug => {
    getDemarcheAction(demarcheIdOrSlug)

    return Promise.resolve(demarche)
  },

  deleteEtape: etapeId => {
    deleteEtapeAction(etapeId)

    return Promise.resolve()
  },

  deposeEtape: etapeId => {
    deposerEtapeAction(etapeId)

    return Promise.resolve()
  },
}

export const FullNoSnapshot: StoryFn = () => (
  <>
    <MapPattern />
    <PureDemarche user={{ ...testBlankUser, role: 'super' }} router={routerPushMock} apiClient={apiClient} demarcheId={demarche.id} />
  </>
)
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
            titre_statut_id: 'val',
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
          sdom_zones: [],
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
            titre_statut_id: 'val',
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
          sdom_zones: [],
        })
      },
    }}
    demarcheId={demarche.id}
  />
)
