import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheEtape } from './demarche-etape'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { toCaminoDate } from 'camino-common/src/date'
import { EtapeEntrepriseDocument, documentIdValidator, entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { Router } from 'vue-router'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EtapeDocument, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'
import { ApiClient } from '@/api/api-client'

const meta: Meta = {
  title: 'Components/Demarche/Etape',
  // @ts-ignore
  component: DemarcheEtape,
  decorators: [vueRouter([{ name: 'entreprise' }, { name: 'etape-edition' }]), () => ({ template: '<div class="dsfr"><story/></div>' })],
}

export default meta

const date = toCaminoDate('2023-10-24')
const titreSlug = titreSlugValidator.parse('titre-slug')
const routerPushAction = action('routerPushAction')
const deleteEtapeAction = action('deleteEtapeAction')
const deposeEtapeAction = action('deposeEtapeAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')

const apiClient: Pick<ApiClient, 'deleteEtape' | 'deposeEtape' | 'getGeojsonByGeoSystemeId'> = {
  deleteEtape: etapeId => {
    deleteEtapeAction(etapeId)

    return Promise.resolve()
  },
  deposeEtape: etapeId => {
    deposeEtapeAction(etapeId)

    return Promise.resolve()
  },

  getGeojsonByGeoSystemeId: (geojson, systemId) => {
    getGeojsonByGeoSystemeIdAction(geojson, systemId)

    return Promise.resolve(geojson)
  },
}

const routerPushMock: Pick<Router, 'push'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
}
const documentsDemande: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    document_type_id: 'car',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'dom',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id3'),
    document_type_id: 'for',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id4'),
    document_type_id: 'jpa',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
]

const entrepriseDocumentsDemande: EtapeEntrepriseDocument[] = [
  {
    id: entrepriseDocumentIdValidator.parse('id'),
    date: toCaminoDate('2023-01-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.attestationFiscale,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.curriculumVitae,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id3'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDIdentite,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id4'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id5'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.kbis,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id3'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres,
    entreprise_id: entrepriseIdValidator.parse('entrepriseId'),
    description: 'Une description',
  },
]

const documents: EtapeDocument[] = [
  {
    id: documentIdValidator.parse('id'),
    document_type_id: 'aac',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'acg',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: documentIdValidator.parse('id2'),
    document_type_id: 'acm',
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
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: 'bil',
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
]

export const NoSnapshotDemande: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{
      demarche_type_id: 'oct',
      titulaires: [
        { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1' },
        { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2' },
      ],
      administrationsLocales: [],
      sdom_zones: [],
    }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      notes: null,
      slug: etapeSlugValidator.parse('etape-slug'),
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
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 10,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }],
      documents: [],
      entreprises_documents: [],
    }}
  />
)

export const DemandeMultipleEntreprisesDocuments: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{
      demarche_type_id: 'oct',
      titulaires: [
        { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1' },
        { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2' },
      ],
      administrationsLocales: [],
      sdom_zones: [],
    }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      date,
      notes: 'Super note',
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
        perimetre: null,
      },
      sections_with_values: [
        { id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' },
        {
          id: 'odlep',
          elements: [
            {
              id: 'lien',
              nom: 'Lien public externe',
              type: 'url',
              optionnel: true,
              description: '',
              value: 'https://beta.gouv.fr',
            },
          ],
        },
      ],
      documents,
      entreprises_documents: [
        ...entrepriseDocuments,
        {
          id: entrepriseDocumentIdValidator.parse('id3'),
          date: toCaminoDate('2023-02-01'),
          entreprise_document_type_id: 'atf',
          entreprise_id: entrepriseIdValidator.parse('titulaire2'),
          description: null,
        },
        {
          id: entrepriseDocumentIdValidator.parse('id4'),
          date: toCaminoDate('2023-03-01'),
          entreprise_document_type_id: 'bil',
          entreprise_id: entrepriseIdValidator.parse('titulaire2'),
          description: 'Une description',
        },
      ],
    }}
  />
)

export const DemandeNoMap: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [{ id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1' }], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      notes: null,
      slug: etapeSlugValidator.parse('etape-slug'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
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
        perimetre: null,
      },
      sections_with_values: [
        { id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' },
        {
          id: 'odlep',
          elements: [
            {
              id: 'lien',
              nom: 'Lien public externe',
              type: 'url',
              optionnel: true,
              description: '',
              value: 'https://beta.gouv.fr',
            },
          ],
        },
      ],
      documents,
      entreprises_documents: entrepriseDocuments,
    }}
  />
)

export const DemandeNonDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
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
        perimetre: null,
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }],
      documents: [],
      entreprises_documents: [],
    }}
  />
)

export const DemandeArmMecaniseNonDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [{ id: entrepriseIdValidator.parse('entrepriseId'), nom: 'titulaire1' }], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
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
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 10,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }],
      documents: documentsDemande,
      entreprises_documents: entrepriseDocumentsDemande,
    }}
  />
)

export const DemandeArmMecaniseDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [{ id: entrepriseIdValidator.parse('entrepriseId'), nom: 'titulaire1' }], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
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
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 10,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation' }], nom: 'Arm' }],
      documents: [
        ...documentsDemande,
        { id: documentIdValidator.parse('idDoe'), document_type_id: 'doe', public_lecture: true, entreprises_lecture: true, description: null },
        { id: documentIdValidator.parse('idDep'), document_type_id: 'dep', public_lecture: true, entreprises_lecture: true, description: null },
      ],
      entreprises_documents: entrepriseDocumentsDemande,
    }}
  />
)

export const DemandeArmNonMecaniseDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [{ id: entrepriseIdValidator.parse('entrepriseId'), nom: 'titulaire1' }], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
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
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 10,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: false, nom: 'Mécanisation' }], nom: 'Arm' }],
      documents: documentsDemande,
      entreprises_documents: entrepriseDocumentsDemande,
    }}
  />
)

export const Depot: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [{ id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1' }], administrationsLocales: [], sdom_zones: [] }}
    router={routerPushMock}
    user={{ ...testBlankUser, role: 'super' }}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeStatutId,
      date,
      sections_with_values: [],
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      documents,
      entreprises_documents: entrepriseDocuments,
    }}
    apiClient={apiClient}
  />
)

export const AvisDefavorable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_.DEFAVORABLE.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.avisDGTMServiceAmenagementUrbanismeConstructionLogement_AUCL_.DEFAVORABLE.etapeStatutId,
      date,
      sections_with_values: [],
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      documents: [],
      entreprises_documents: [],
    }}
    apiClient={apiClient}
  />
)

export const DemandeAvecSeulementPerimetre: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: null,
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
      date,
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      fondamentale: {
        date_debut: null,
        duree: null,
        date_fin: null,
        substances: [],
        titulaires: [],
        amodiataires: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 0,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [],
      documents: [],
      entreprises_documents: [],
    }}
  />
)

export const DemandeAvecGrosseNote: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaires: [], administrationsLocales: [], sdom_zones: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      notes: 'Ceci est une énorme note sur plusieurs lignes.\n Une seconde ligne.\n Incertitudes: \n * date \n * substances \n * titulaires',
      etape_type_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
      date,
      decisions_annexes_contenu: {},
      decisions_annexes_sections: [],
      fondamentale: {
        date_debut: null,
        duree: null,
        date_fin: null,
        substances: [],
        titulaires: [],
        amodiataires: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: {
            properties: {},
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
          surface: 0,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [],
      documents: [],
      entreprises_documents: [],
    }}
  />
)
