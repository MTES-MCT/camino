import { Meta, StoryFn } from '@storybook/vue3'
import { demarcheIdValidator } from 'camino-common/src/demarche'
import { ResultatMiseEnConcurrence, Props } from './resultat-mise-en-concurrence'
import { titreSlugValidator } from 'camino-common/src/validators/titres'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { Entreprise, newEntrepriseId } from 'camino-common/src/entreprise'
import { km2Validator } from 'camino-common/src/number'
import { ETAPES_TYPES } from 'camino-common/src/static/etapesTypes'
import { action } from '@storybook/addon-actions'
import { firstEtapeDateValidator, toCaminoDate } from 'camino-common/src/date'
import { ApiClient } from '@/api/api-client'
import { tempDocumentNameValidator } from 'camino-common/src/document'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Titre/ResultatMiseEnConcurrence',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: ResultatMiseEnConcurrence,
}
export default meta

const demarcheId = demarcheIdValidator.parse('demarcheId')

const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const etapeCreerAction = action('etapeCreer')
const uploadTempDocumentAction = action('uploadTempDocument')
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const geojson4326_perimetre: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-52.5660583466962, 4.23944263425535],
          [-52.5591878553913, 4.22269896902571],
          [-52.5550566725882, 4.22438936251509],
          [-52.5619271168799, 4.24113309117193],
          [-52.5660583466962, 4.23944263425535],
        ],
      ],
    ],
  },
}

const entrepriseId1 = newEntrepriseId('Titulaire Pivot')
const entrepriseId2 = newEntrepriseId('Titulaire Satellite')

const entreprises: Entreprise[] = [
  { id: entrepriseId1, legal_siren: null, nom: 'Titulaire Pivot' },
  { id: entrepriseId2, legal_siren: null, nom: 'Titulaire Satellite' },
]

const perimetre: Props['pivot']['perimetreTotal'] = {
  geojson4326_perimetre,
  surface: km2Validator.parse(5),
}

const perimetreSatellite: Props['pivot']['perimetreSansSatellite'] = {
  geojson4326_perimetre: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-53, 4.23944263425535],
            [-52.5591878553913, 4.22269896902571],
            [-52.5550566725882, 4.22438936251509],
            [-52.5619271168799, 4.24113309117193],
            [-53, 4.23944263425535],
          ],
        ],
      ],
    },
  },
  surface: km2Validator.parse(5),
}

const firstEtapeDate = firstEtapeDateValidator.parse('2024-10-01')
const apiClient: Pick<ApiClient, 'getEtapesTypesEtapesStatuts' | 'etapeCreer' | 'uploadTempDocument' | 'getEtapeDocumentsByEtapeId'> = {
  getEtapeDocumentsByEtapeId: async etapeId => {
    getEtapeDocumentsByEtapeIdAction(etapeId)
    return { etapeDocuments: [] }
  },
  getEtapesTypesEtapesStatuts(titreDemarcheId, titreEtapeId, date) {
    getEtapesTypesEtapesStatutsAction(titreDemarcheId, titreEtapeId, date)
    return Promise.resolve({ [ETAPES_TYPES.resultatMiseEnConcurrence]: { etapeStatutIds: ['acc', 'rej'], mainStep: true } })
  },
  etapeCreer(etape) {
    etapeCreerAction(etape)
    return new Promise(() => ({}))
  },
  uploadTempDocument: async temp => {
    uploadTempDocumentAction(temp)
    return tempDocumentNameValidator.parse('plop')
  },
}
export const Default: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    initDecision="acc"
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
    }}
    user={{ ...testBlankUser, role: 'super' }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetreSatellite,
      perimetreTotal: perimetre,
      firstEtapeDate: firstEtapeDate,
    }}
  />
)

export const Loading: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapesTypesEtapesStatuts() {
        return new Promise(() => ({}))
      },
    }}
    user={{ ...testBlankUser, role: 'super' }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
      firstEtapeDate: firstEtapeDate,
    }}
  />
)

export const WithError: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapesTypesEtapesStatuts() {
        return Promise.resolve({ message: "Message d'erreur" })
      },
    }}
    user={{ ...testBlankUser, role: 'super' }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
      firstEtapeDate: firstEtapeDate,
    }}
  />
)

export const PerimetreSansSatellite: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    initDecision="acc"
    entreprises={entreprises}
    apiClient={apiClient}
    user={{ ...testBlankUser, role: 'super' }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: { geojson4326_perimetre: null, surface: km2Validator.parse(0) },
      perimetreTotal: perimetre,
      firstEtapeDate: firstEtapeDate,
    }}
  />
)

export const PerimetreAvecSatelliteEquivalent: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    initDecision="acc"
    entreprises={entreprises}
    apiClient={apiClient}
    user={{ ...testBlankUser, role: 'super' }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
      firstEtapeDate: firstEtapeDate,
    }}
  />
)
