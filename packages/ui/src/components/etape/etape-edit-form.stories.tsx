import { EtapeEditForm, Props } from './etape-edit-form'
import { Meta, StoryFn } from '@storybook/vue3'
import { Etape, EtapeDocument, EtapeId, FullEtapeHeritage, etapeIdValidator } from 'camino-common/src/etape'
import { Entreprise, EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator, newEntrepriseId } from 'camino-common/src/entreprise'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { DeepReadonly } from 'vue'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TempDocumentName, tempDocumentNameValidator } from 'camino-common/src/document'
import { UiEntrepriseDocumentInput } from '../entreprise/entreprise-api-client'

const meta: Meta = {
  title: 'Components/Etape/Edition',
  // @ts-ignore
  component: EtapeEditForm,
  argTypes: {},
}
export default meta

const entreprises: Entreprise[] = [...Array(10)].map((_e, i) => ({ id: entrepriseIdValidator.parse(`entrepriseId${i}`), nom: `Nom de l'entreprise ${i}`, legal_siren: `legal_siren${i}` }))

const heritageProps: FullEtapeHeritage['heritageProps'] = {
  dateDebut: {
    actif: false,
  },
  dateFin: {
    actif: false,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      dateFin: toCaminoDate('2022-01-01'),
    },
  },
  duree: {
    actif: false,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      duree: 12,
    },
  },
  substances: {
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      substances: ['arge'],
    },
  },
  titulaires: {
    actif: false,
  },
  amodiataires: {
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      amodiataires: [
        { id: entreprises[0].id, operateur: false },
        { id: entreprises[1].id, operateur: false },
        { id: entreprises[2].id, operateur: false },
      ],
    },
  },
  perimetre: {
    actif: false,
  },
}

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

const etape: DeepReadonly<Etape> = {
  id: etapeIdValidator.parse('id'),
  statutId: 'fai',
  typeId: 'mfr',
  contenu: { arm: { mecanise: true, franchissements: 2 } },
  date: toCaminoDate('2022-02-02'),
  dateDebut: toCaminoDate('2022-02-02'),
  dateFin: undefined,
  duree: 4,
  substances: ['arse'],
  titulaires: [{ id: newEntrepriseId('optionId1'), operateur: true }],
  amodiataires: [],
  notes: 'Super notes de cette story',
  geojson4326Forages: undefined,
  geojson4326Perimetre: undefined,
  geojson4326Points: undefined,
  surface: undefined,
  geojsonOriginePerimetre: undefined,
  geojsonOriginePoints: undefined,
  geojsonOrigineGeoSystemeId: undefined,
  geojsonOrigineForages: undefined,
}

const completeUpdate = action('completeUpdate')
const alertesUpdate = action('alertesUpdate')
const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const getEtapeHeritageAction = action('getEtapeHeritage')
const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocumentAction')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')

const apiClient: Props['apiClient'] = {
  getEntrepriseDocuments() {
    return Promise.resolve([])
  },
  getEtapesTypesEtapesStatuts(demarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) {
    getEtapesTypesEtapesStatutsAction(demarcheId, titreEtapeId, date)

    return Promise.resolve([
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mfr', etapeStatutId: 'aco', mainStep: true },
      { etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true },
    ])
  },
  getEtapeHeritage(titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) {
    getEtapeHeritageAction(titreDemarcheId, date, typeId)

    return Promise.resolve({
      heritageContenu: { arm: { mecanise: { actif: false }, franchissements: { actif: false } } },
      heritageProps,
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
  getEtapeDocumentsByEtapeId(etapeId: EtapeId): Promise<EtapeDocument[]> {
    getEtapeDocumentsByEtapeIdAction(etapeId)

    return Promise.resolve([])
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
    alertesUpdate={alertesUpdate}
    apiClient={apiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="arm"
    sdomZoneIds={[]}
    etape={etape}
    completeUpdate={completeUpdate}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
  />
)

export const EtapeModification: StoryFn = () => (
  <EtapeEditForm
    initTab="points"
    alertesUpdate={alertesUpdate}
    apiClient={apiClient}
    demarcheId={demarcheIdValidator.parse('demarcheId')}
    demarcheTypeId="oct"
    titreSlug={titreSlugValidator.parse('titre-slug')}
    titreTypeId="cxw"
    sdomZoneIds={[]}
    etape={{ ...etape, geojson4326Perimetre: perimetre, geojsonOriginePerimetre: perimetre, geojsonOrigineGeoSystemeId: '4326' }}
    completeUpdate={completeUpdate}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    entreprises={entreprises}
  />
)

// FIXME tests avec
// - heritageContenu
// - avec aide (arm/axm)
// - étape en construction
// - avec du sdom
// - avec une arm mécanisé
// - demande AXM d'une entreprise (avec les 3 étapes imbriquées)
