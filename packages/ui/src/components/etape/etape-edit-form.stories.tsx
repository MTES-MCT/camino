import { EtapeEditForm, Props } from './etape-edit-form'
import { Meta, StoryFn } from '@storybook/vue3'
import { EtapeId, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { Entreprise, EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator, newEntrepriseId } from 'camino-common/src/entreprise'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TempDocumentName, tempDocumentNameValidator } from 'camino-common/src/document'
import { UiEntrepriseDocumentInput } from '../entreprise/entreprise-api-client'

const meta: Meta = {
  title: 'Components/Etape/EditForm',
  // @ts-ignore
  component: EtapeEditForm,
  argTypes: {},
}
export default meta

const entreprises: Entreprise[] = [...Array(10)].map((_e, i) => ({ id: entrepriseIdValidator.parse(`entrepriseId${i}`), nom: `Nom de l'entreprise ${i}`, legal_siren: `legal_siren${i}` }))

const perimetre: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},

  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.54, 4.22269896902571],
          [-52.55, 4.22438936251509],
          [-52.55, 4.24113309117193],
          [-52.54, 4.22269896902571],
        ],
      ],
    ],
  },
}

const etape: Props['etape'] = {
  id: etapeIdValidator.parse('id'),
  slug: etapeSlugValidator.parse('slug'),
  titreDemarcheId: demarcheIdValidator.parse('demarcheId'),
  statutId: 'fai',
  isBrouillon: false,
  typeId: 'mfr',
  contenu: { arm: { mecanise: { value: null, heritee: false, etapeHeritee: null }, franchissements: { value: null, heritee: false, etapeHeritee: null } } },
  date: toCaminoDate('2022-02-02'),
  dateDebut: { value: toCaminoDate('2022-02-02'), heritee: false, etapeHeritee: null },
  dateFin: {
    value: null,
    heritee: false,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: toCaminoDate('2022-01-01'),
    },
  },
  duree: {
    value: 4,
    heritee: false,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: 12,
    },
  },
  substances: {
    value: ['arge'],
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: ['arge'],
    },
  },
  titulaires: { value: [newEntrepriseId('optionId1')], heritee: false, etapeHeritee: null },
  amodiataires: {
    value: [entreprises[0].id, entreprises[1].id, entreprises[2].id],
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: [entreprises[0].id, entreprises[1].id, entreprises[2].id],
    },
  },
  notes: 'Super notes de cette story',
  perimetre: {
    value: {
      geojson4326Forages: null,
      geojson4326Perimetre: null,
      geojson4326Points: null,
      surface: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: null,
      geojsonOrigineForages: null,
    },
    heritee: false,
    etapeHeritee: null,
  },
}

const goToDemarcheAction = action('goToDemarche')
const deposeEtapeAction = action('deposeEtape')
const etapeCreerAction = action('etapeCreer')
const etapeModifierAction = action('etapeModifier')
const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const getEtapeHeritagePotentielAction = action('getEtapeHeritagePotentiel')
const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')

const etapeEditFormApiClient: Props['apiClient'] = {
  deposeEtape(etapeId) {
    deposeEtapeAction(etapeId)

    return Promise.resolve(undefined)
  },
  etapeCreer(etape) {
    etapeCreerAction(etape)

    return Promise.resolve(etapeIdValidator.parse('etapeIdSaved'))
  },
  etapeModifier(etape) {
    etapeModifierAction(etape)

    return Promise.resolve(etape.id)
  },
  getEntrepriseDocuments() {
    return Promise.resolve([])
  },
  getEtapesTypesEtapesStatuts(demarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) {
    getEtapesTypesEtapesStatutsAction(demarcheId, titreEtapeId, date)

    return Promise.resolve([
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true },
    ])
  },
  getEtapeHeritagePotentiel(etape, titreDemarcheId) {
    getEtapeHeritagePotentielAction(etape, titreDemarcheId)
    return Promise.resolve({
      ...etape,
      duree: {
        value: etape.duree.value,
        heritee: false,
        etapeHeritee: {
          date: toCaminoDate('2022-01-01'),
          etapeTypeId: 'mfr',
          value: 12,
        },
      },
      substances: {
        value: ['arge'],
        heritee: true,
        etapeHeritee: {
          date: toCaminoDate('2022-01-01'),
          etapeTypeId: 'mfr',
          value: ['arge'],
        },
      },
      dateDebut: { value: etape.dateDebut.value, heritee: false, etapeHeritee: null },
      titulaires: { value: etape.titulaires.value, heritee: false, etapeHeritee: null },
      amodiataires: {
        value: [entreprises[0].id, entreprises[1].id, entreprises[2].id],
        heritee: true,
        etapeHeritee: {
          date: toCaminoDate('2022-01-01'),
          etapeTypeId: 'mfr',
          value: [entreprises[0].id, entreprises[1].id, entreprises[2].id],
        },
      },
      perimetre: { value: etape.perimetre.value, heritee: false, etapeHeritee: null },
      dateFin: {
        value: etape.dateFin.value,
        heritee: false,
        etapeHeritee: {
          date: toCaminoDate('2022-01-01'),
          etapeTypeId: 'mfr',
          value: toCaminoDate('2022-01-01'),
        },
      },
      heritageContenu: { arm: { mecanise: { actif: false }, franchissements: { actif: false } } },
    })
  },
  geojsonImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  geojsonPointsImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  geojsonForagesImport(body, geoSystemeId) {
    geojsonImportAction(body, geoSystemeId)

    return Promise.reject(new Error('plop'))
  },
  uploadTempDocument(document) {
    uploadTempDocumentAction(document)

    return Promise.resolve(tempDocumentNameValidator.parse('name'))
  },
  getGeojsonByGeoSystemeId(geojson, geoSystemeId) {
    getGeojsonByGeoSystemeIdAction(geojson, geoSystemeId)

    return Promise.resolve(geojson)
  },
  getEtapeDocumentsByEtapeId(etapeId: EtapeId) {
    getEtapeDocumentsByEtapeIdAction(etapeId)

    return Promise.resolve({ etapeDocuments: [], dae: null, asl: null })
  },
  getEtapeEntrepriseDocuments(etapeId: EtapeId): Promise<EtapeEntrepriseDocument[]> {
    getEtapeEntrepriseDocumentsAction(etapeId)

    return Promise.resolve([])
  },
  creerEntrepriseDocument(entrepriseId: EntrepriseId, entrepriseDocumentInput: UiEntrepriseDocumentInput, tempDocumentName: TempDocumentName): Promise<EntrepriseDocumentId> {
    creerEntrepriseDocumentAction(entrepriseId, entrepriseDocumentInput, tempDocumentName)

    return Promise.resolve(entrepriseDocumentIdValidator.parse('entrepriseDocumentId'))
  },
}

export const Default: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    perimetre={{ sdomZoneIds: [], superposition_alertes: [] }}
    apiClient={etapeEditFormApiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="arm"
    etape={{
      ...etape,

      contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null }, franchissements: { value: 2, heritee: false, etapeHeritee: null } } },
    }}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
    goToDemarche={goToDemarcheAction}
  />
)

export const EtapeModification: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    apiClient={etapeEditFormApiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="cxw"
    perimetre={{ sdomZoneIds: [], superposition_alertes: [] }}
    etape={{
      ...etape,
      contenu: { cxx: { volume: { value: null, heritee: false, etapeHeritee: null }, volumeUniteId: { value: null, heritee: false, etapeHeritee: null } } },
      perimetre: {
        value: {
          geojson4326Perimetre: perimetre,
          geojsonOriginePerimetre: perimetre,
          geojsonOrigineGeoSystemeId: '4326',
          geojson4326Forages: null,
          geojson4326Points: null,
          geojsonOrigineForages: null,
          geojsonOriginePoints: null,
          surface: null,
        },
        heritee: false,
        etapeHeritee: null,
      },
    }}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
    goToDemarche={goToDemarcheAction}
  />
)
