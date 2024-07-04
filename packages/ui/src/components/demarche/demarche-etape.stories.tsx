import { Meta, StoryFn } from '@storybook/vue3'
import { DemarcheEtape } from './demarche-etape'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { toCaminoDate } from 'camino-common/src/date'
import { Entreprise, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator } from 'camino-common/src/entreprise'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { action } from '@storybook/addon-actions'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, EtapeDocument, etapeDocumentIdValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { DOCUMENTS_TYPES_IDS } from 'camino-common/src/static/documentsTypes'
import { ApiClient } from '@/api/api-client'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { ZERO_KM2, km2Validator } from 'camino-common/src/number'
import { CaminoRouter } from '@/typings/vue-router'

const meta: Meta = {
  title: 'Components/Demarche/Etape',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DemarcheEtape,
}

export default meta

const date = toCaminoDate('2023-10-24')
const titreSlug = titreSlugValidator.parse('titre-slug')
const routerPushAction = action('routerPushAction')
const deleteEtapeAction = action('deleteEtapeAction')
const deposeEtapeAction = action('deposeEtapeAction')

const entreprises: Entreprise[] = [
  { id: entrepriseIdValidator.parse('titulaire1'), nom: 'titulaire1', legal_siren: '' },
  { id: entrepriseIdValidator.parse('titulaire2'), nom: 'titulaire2', legal_siren: '' },
  { id: entrepriseIdValidator.parse('amodiataire1'), nom: 'amodiataire1', legal_siren: '' },
]

const apiClient: Pick<ApiClient, 'deleteEtape' | 'deposeEtape'> = {
  deleteEtape: etapeId => {
    deleteEtapeAction(etapeId)

    return Promise.resolve()
  },
  deposeEtape: etapeId => {
    deposeEtapeAction(etapeId)

    return Promise.resolve()
  },
}

const routerPushMock: Pick<CaminoRouter, 'push'> = {
  push: to => {
    routerPushAction(to)

    return Promise.resolve()
  },
}
const documentsDemande: EtapeDocument[] = [
  {
    id: etapeDocumentIdValidator.parse('id'),
    etape_document_type_id: 'car',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
    etape_document_type_id: 'dom',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: etapeDocumentIdValidator.parse('id3'),
    etape_document_type_id: 'for',
    description: null,
    public_lecture: false,
    entreprises_lecture: true,
  },
  {
    id: etapeDocumentIdValidator.parse('id4'),
    etape_document_type_id: 'jpa',
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
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: null,
  },
  {
    id: entrepriseDocumentIdValidator.parse('id2'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.curriculumVitae,
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id3'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDIdentite,
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id4'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesTechniques,
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id5'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.kbis,
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
  {
    id: entrepriseDocumentIdValidator.parse('id3'),
    date: toCaminoDate('2023-03-01'),
    entreprise_document_type_id: DOCUMENTS_TYPES_IDS.justificatifDesCapacitesFinancieres,
    entreprise_id: entrepriseIdValidator.parse('titulaire1'),
    description: 'Une description',
  },
]

const documents: EtapeDocument[] = [
  {
    id: etapeDocumentIdValidator.parse('id'),
    etape_document_type_id: 'aac',
    description: 'Une description',
    public_lecture: false,
    entreprises_lecture: false,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
    etape_document_type_id: 'acg',
    description: null,
    public_lecture: true,
    entreprises_lecture: true,
  },
  {
    id: etapeDocumentIdValidator.parse('id2'),
    etape_document_type_id: 'acm',
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
      titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
      administrationsLocales: [],
      sdom_zones: [],
      communes: [],
      etapes: [],
    }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      note: { valeur: '', is_avertissement: false },
      slug: etapeSlugValidator.parse('etape-slug'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      date,

      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
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
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: {
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
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: km2Validator.parse(10),
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

export const DemandeMultipleEntreprisesDocuments: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{
      demarche_type_id: 'oct',
      titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
      administrationsLocales: [],
      sdom_zones: [],
      communes: [],
      etapes: [],
    }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      date,
      note: { valeur: 'Super note', is_avertissement: false },
      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: null,
      },
      sections_with_values: [
        { id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' },
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
      etape_documents: documents,
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
      avis_documents: [],
    }}
  />
)

export const DemandeNoMap: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      note: { valeur: '', is_avertissement: false },
      slug: etapeSlugValidator.parse('etape-slug'),
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      date,
      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: null,
      },
      sections_with_values: [
        { id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' },
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
      etape_documents: documents,
      entreprises_documents: entrepriseDocuments,
      avis_documents: [],
    }}
  />
)

export const DemandeNonDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: null,
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

export const DemandeNonSupprimable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], communes: [], etapes: [] }}
    user={{
      ...testBlankUser,
      role: 'entreprise',
      entreprises: [
        {
          id: entrepriseIdValidator.parse('titulaire1'),
        },
      ],
    }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,
      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: null,
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

const demandeArmMecaniseNonDeposable: FeatureMultiPolygon = {
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
}
export const DemandeArmMecaniseNonDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeArmMecaniseNonDeposable,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeArmMecaniseNonDeposable,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: km2Validator.parse(10),
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: documentsDemande,
      entreprises_documents: entrepriseDocumentsDemande,
      avis_documents: [],
    }}
  />
)
const demandeArmMecaniseDeposable: FeatureMultiPolygon = {
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
}

export const DemandeArmMecaniseDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: {
          geojson4326_perimetre: demandeArmMecaniseDeposable,
          geojson4326_points: null,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeArmMecaniseDeposable,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: km2Validator.parse(10),
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: [
        ...documentsDemande,
        { id: etapeDocumentIdValidator.parse('idDoe'), etape_document_type_id: 'doe', public_lecture: true, entreprises_lecture: true, description: null },
        { id: etapeDocumentIdValidator.parse('idDep'), etape_document_type_id: 'dep', public_lecture: true, entreprises_lecture: true, description: null },
      ],
      entreprises_documents: entrepriseDocumentsDemande,
      avis_documents: [],
    }}
  />
)

const demandeArmNonMecaniseDeposable: FeatureMultiPolygon = {
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
}
export const DemandeArmNonMecaniseDeposable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: toCaminoDate('2023-10-25'),
        duree: 12,
        date_fin: null,
        substances: ['auru', 'arge'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1'), entrepriseIdValidator.parse('titulaire2')],
        amodiataireIds: [entrepriseIdValidator.parse('amodiataire1')],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeArmNonMecaniseDeposable,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeArmNonMecaniseDeposable,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: km2Validator.parse(10),
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: false, nom: 'Mécanisation', optionnel: false }], nom: 'Arm' }],
      etape_documents: documentsDemande,
      entreprises_documents: entrepriseDocumentsDemande,
      avis_documents: [],
    }}
  />
)

export const Depot: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    router={routerPushMock}
    user={{ ...testBlankUser, role: 'super' }}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.depotDeLaDemande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      date,
      sections_with_values: [],
      etape_documents: documents,
      entreprises_documents: entrepriseDocuments,
      avis_documents: [],
    }}
    apiClient={apiClient}
    entreprises={entreprises}
  />
)

export const AvisDefavorable: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.avisDuConseilGeneralDeLeconomie_CGE_.DEFAVORABLE.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.avisDuConseilGeneralDeLeconomie_CGE_.DEFAVORABLE.etapeStatutId,
      is_brouillon: ETAPE_IS_NOT_BROUILLON,
      date,
      sections_with_values: [],

      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
    apiClient={apiClient}
    entreprises={entreprises}
  />
)

const demandeAvecSeulementPerimetre: FeatureMultiPolygon = {
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
}
export const DemandeAvecSeulementPerimetre: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: null,
        duree: null,
        date_fin: null,
        substances: [],
        titulaireIds: [],
        amodiataireIds: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeAvecSeulementPerimetre,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeAvecSeulementPerimetre,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: ZERO_KM2,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

const demandeAvecGrosseNote: FeatureMultiPolygon = {
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
}
export const DemandeAvecGrosseNote: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: 'Ceci est une énorme note sur plusieurs lignes.\n Une seconde ligne.\n Incertitudes: \n * date \n * substances \n * titulaireIds', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: null,
        duree: null,
        date_fin: null,
        substances: [],
        titulaireIds: [],
        amodiataireIds: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeAvecGrosseNote,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeAvecGrosseNote,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: ZERO_KM2,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

export const AxmDeposableAvecDaeEtAsl: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'dmi', typeId: 'axm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{
      demarche_type_id: 'oct',
      titulaireIds: [entrepriseIdValidator.parse('titulaire1')],
      administrationsLocales: [],
      sdom_zones: [],
      etapes: [
        {
          date: toCaminoDate('2024-04-22'),
          id: etapeIdValidator.parse('idDae'),
          entreprises_documents: [],
          etape_documents: [],
          avis_documents: [],
          etape_statut_id: 'exe',
          etape_type_id: 'dae',
          is_brouillon: ETAPE_IS_NOT_BROUILLON,
          note: { valeur: '', is_avertissement: false },
          sections_with_values: [],
          ordre: 1,
          slug: etapeSlugValidator.parse('slug-dae'),
        },
        {
          date: toCaminoDate('2024-04-22'),
          id: etapeIdValidator.parse('idAsl'),
          entreprises_documents: [],
          etape_documents: [],
          avis_documents: [],
          etape_statut_id: 'exe',
          etape_type_id: 'asl',
          is_brouillon: ETAPE_IS_NOT_BROUILLON,
          note: { valeur: '', is_avertissement: false },
          sections_with_values: [],
          ordre: 2,
          slug: etapeSlugValidator.parse('slug-asl'),
        },
      ],
      communes: [],
    }}
    user={{ ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('titulaire1') }] }}
    router={routerPushMock}
    apiClient={apiClient}
    entreprises={entreprises}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: null,
        duree: 4,
        date_fin: null,
        substances: ['auru'],
        titulaireIds: [entrepriseIdValidator.parse('titulaire1')],
        amodiataireIds: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeAvecGrosseNote,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeAvecGrosseNote,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: ZERO_KM2,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },
      sections_with_values: [],
      etape_documents: [
        ...documentsDemande,
        { id: etapeDocumentIdValidator.parse('idlem'), etape_document_type_id: 'lem', description: null, entreprises_lecture: true, public_lecture: true },
        { id: etapeDocumentIdValidator.parse('ididm'), etape_document_type_id: 'idm', description: null, entreprises_lecture: true, public_lecture: true },
        { id: etapeDocumentIdValidator.parse('idmes'), etape_document_type_id: 'mes', description: null, entreprises_lecture: true, public_lecture: true },
        { id: etapeDocumentIdValidator.parse('idmet'), etape_document_type_id: 'met', description: null, entreprises_lecture: true, public_lecture: true },
        { id: etapeDocumentIdValidator.parse('idprg'), etape_document_type_id: 'prg', description: null, entreprises_lecture: true, public_lecture: true },
        { id: etapeDocumentIdValidator.parse('idsch'), etape_document_type_id: 'sch', description: null, entreprises_lecture: true, public_lecture: true },
      ],
      entreprises_documents: [
        ...entrepriseDocumentsDemande,

        {
          entreprise_document_type_id: 'lis',
          date: toCaminoDate('2024-04-22'),
          description: null,
          entreprise_id: entrepriseIdValidator.parse('titulaire1'),
          id: entrepriseDocumentIdValidator.parse('idlis'),
        },
        {
          entreprise_document_type_id: 'jac',
          date: toCaminoDate('2024-04-22'),
          description: null,
          entreprise_id: entrepriseIdValidator.parse('titulaire1'),
          id: entrepriseDocumentIdValidator.parse('idjac'),
        },
        {
          entreprise_document_type_id: 'bil',
          date: toCaminoDate('2024-04-22'),
          description: null,
          entreprise_id: entrepriseIdValidator.parse('titulaire1'),
          id: entrepriseDocumentIdValidator.parse('idbil'),
        },
        {
          entreprise_document_type_id: 'ref',
          date: toCaminoDate('2024-04-22'),
          description: null,
          entreprise_id: entrepriseIdValidator.parse('titulaire1'),
          id: entrepriseDocumentIdValidator.parse('idref'),
        },
        {
          entreprise_document_type_id: 'deb',
          date: toCaminoDate('2024-04-22'),
          description: null,
          entreprise_id: entrepriseIdValidator.parse('titulaire1'),
          id: entrepriseDocumentIdValidator.parse('iddeb'),
        },
      ],
      avis_documents: [],
    }}
  />
)

export const DemandeAvecForage: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'pxg', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    user={{ ...testBlankUser, role: 'super' }}
    router={routerPushMock}
    entreprises={entreprises}
    apiClient={apiClient}
    initTab="points"
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.demande.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,

      fondamentale: {
        date_debut: null,
        duree: null,
        date_fin: null,
        substances: [],
        titulaireIds: [],
        amodiataireIds: [],
        perimetre: {
          geojson4326_points: null,
          geojson4326_perimetre: demandeAvecGrosseNote,
          geojson_origine_geo_systeme_id: '4326',
          geojson_origine_perimetre: demandeAvecGrosseNote,
          geojson_origine_points: null,
          geojson4326_forages: null,
          geojson_origine_forages: null,
          surface: ZERO_KM2,
          communes: [],
          sdom_zones: [],
          forets: [],
          secteurs_maritimes: [],
        },
      },

      sections_with_values: [
        {
          id: 'pxg',
          nom: "Propriétés du permis d'exploitation",
          elements: [
            { id: 'debit', nom: 'Débit volumique maximal de pompage', type: 'number', value: 3, uniteId: 'm3h', optionnel: false },
            { id: 'volume', nom: 'Volume maximum de pompage', type: 'number', value: 8, uniteId: 'm3x', optionnel: false },
          ],
        },
      ],
      etape_documents: [],
      entreprises_documents: [],
      avis_documents: [],
    }}
  />
)

export const AvisDesServices: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    router={routerPushMock}
    user={{ ...testBlankUser, role: 'super' }}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: '', is_avertissement: false },
      etape_type_id: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,
      sections_with_values: [],
      etape_documents: documents,
      entreprises_documents: entrepriseDocuments,
      avis_documents: [],
    }}
    apiClient={apiClient}
    entreprises={entreprises}
  />
)

export const EtapeAvecNoteAvertissement: StoryFn = () => (
  <DemarcheEtape
    titre={{ titreStatutId: 'val', typeId: 'arm', nom: 'nom du titre', slug: titreSlug }}
    demarche={{ demarche_type_id: 'oct', titulaireIds: [entrepriseIdValidator.parse('titulaire1')], administrationsLocales: [], sdom_zones: [], etapes: [], communes: [] }}
    router={routerPushMock}
    user={{ ...testBlankUser, role: 'super' }}
    etape={{
      id: etapeIdValidator.parse('etapeId'),
      slug: etapeSlugValidator.parse('etape-slug'),
      note: { valeur: 'Ceci est une note très importante', is_avertissement: true },
      etape_type_id: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives.FAIT.etapeTypeId,
      etape_statut_id: EtapesTypesEtapesStatuts.avisDesServicesEtCommissionsConsultatives.FAIT.etapeStatutId,
      is_brouillon: ETAPE_IS_BROUILLON,
      date,
      sections_with_values: [],
      etape_documents: documents,
      entreprises_documents: entrepriseDocuments,
      avis_documents: [],
    }}
    apiClient={apiClient}
    entreprises={entreprises}
  />
)
