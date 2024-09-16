import { EtapeEditForm, Props } from './etape-edit-form'
import { Meta, StoryFn } from '@storybook/vue3'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, EtapeId, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
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
  isBrouillon: ETAPE_IS_NOT_BROUILLON,
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
  note: {
    valeur: 'Super notes de cette story',
    is_avertissement: false,
  },
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
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const getEtapeAvisByEtapeIdAction = action('getEtapeAvisByEtapeId')

const etapeEditFormApiClient: Props['apiClient'] = {
  getEtapeAvisByEtapeId(etapeId) {
    getEtapeAvisByEtapeIdAction(etapeId)
    return Promise.resolve([])
  },
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

    return Promise.resolve({
      mfr: { etapeStatutIds: ['fai'], mainStep: true },
      mdp: { etapeStatutIds: ['fai'], mainStep: true },
      asc: { etapeStatutIds: ['fai'], mainStep: true },
      aca: { etapeStatutIds: ['fav', 'def'], mainStep: true },
      cac: { etapeStatutIds: ['fai'], mainStep: true },
    })
  },
  getEtapeHeritagePotentiel(etape, titreDemarcheId) {
    getEtapeHeritagePotentielAction(etape, titreDemarcheId)
    return Promise.resolve({
      heritageProps: {
        duree: {
          actif: false,
          etape: { date: toCaminoDate('2022-01-01'), typeId: 'mfr', duree: 12 },
        },
        substances: {
          actif: true,
          etape: {
            date: toCaminoDate('2022-01-01'),
            typeId: 'mfr',
            substances: ['arge'],
          },
        },
        dateDebut: { actif: false, etape: null },
        titulaires: { actif: false, etape: null },
        amodiataires: {
          actif: true,
          etape: {
            date: toCaminoDate('2022-01-01'),
            typeId: 'mfr',
            amodiataireIds: [entreprises[0].id, entreprises[1].id, entreprises[2].id],
          },
        },
        perimetre: { actif: false, etape: null },
        dateFin: {
          actif: false,
          etape: {
            date: toCaminoDate('2022-01-01'),
            typeId: 'mfr',
            dateFin: toCaminoDate('2022-01-01'),
          },
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
    perimetre={{ sdomZoneIds: [], superposition_alertes: [], communes: [] }}
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
    perimetre={{ sdomZoneIds: [], superposition_alertes: [], communes: [] }}
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

export const EtapeModificationAvis: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    apiClient={etapeEditFormApiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="cxw"
    perimetre={{ sdomZoneIds: [], superposition_alertes: [], communes: [] }}
    etape={{
      ...etape,
      typeId: 'asc',
      isBrouillon: ETAPE_IS_BROUILLON,
    }}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
    goToDemarche={goToDemarcheAction}
  />
)
export const EtapeDecisionAdministration: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    apiClient={etapeEditFormApiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="cxw"
    perimetre={{ sdomZoneIds: [], superposition_alertes: [], communes: [] }}
    etape={{
      ...etape,
      typeId: 'aca',
      statutId: 'fav',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
      contenu: {},
    }}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
    goToDemarche={goToDemarcheAction}
  />
)
export const EtapeConsultationAdministrationsCentrales: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    apiClient={etapeEditFormApiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="cxw"
    perimetre={{ sdomZoneIds: [], superposition_alertes: [], communes: [] }}
    etape={{
      ...etape,
      typeId: 'cac',
      statutId: 'fai',
      isBrouillon: ETAPE_IS_NOT_BROUILLON,
    }}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
    goToDemarche={goToDemarcheAction}
  />
)
