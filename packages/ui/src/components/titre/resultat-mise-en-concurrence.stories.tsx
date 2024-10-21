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
import { etapeIdValidator } from 'camino-common/src/etape'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Titre/ResultatMiseEnConcurrence',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: ResultatMiseEnConcurrence,
}
export default meta

const demarcheId = demarcheIdValidator.parse('demarcheId')

const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const etapeCreerAction = action('etapeCreer')
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

export const Default: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    entreprises={entreprises}
    apiClient={{
      getEtapesTypesEtapesStatuts(titreDemarcheId, titreEtapeId, date) {
        getEtapesTypesEtapesStatutsAction(titreDemarcheId, titreEtapeId, date)
        return Promise.resolve({ [ETAPES_TYPES.resultatMiseEnConcurrence]: { etapeStatutIds: ['acc', 'rej'], mainStep: true } })
      },
      etapeCreer(etape) {
        etapeCreerAction(etape)
        return new Promise(() => ({}))
      },
    }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
    }}
    satellites={[
      {
        demarcheId: demarcheIdValidator.parse('idSatellite'),
        demarcheTypeId: 'oct',
        titreNom: 'Satellite',
        titreSlug: titreSlugValidator.parse('titreSatelliteSlug'),
        titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        titulaireId: entrepriseId2,
        perimetreEnCommun: perimetre,
      },
    ]}
  />
)

export const Loading: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    entreprises={entreprises}
    apiClient={{
      getEtapesTypesEtapesStatuts() {
        return new Promise(() => ({}))
      },
      etapeCreer(etape) {
        etapeCreerAction(etape)
        return Promise.resolve(etapeIdValidator.parse('etapeId'))
      },
    }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
    }}
    satellites={[
      {
        demarcheId: demarcheIdValidator.parse('idSatellite'),
        demarcheTypeId: 'oct',
        titreNom: 'Satellite',
        titreSlug: titreSlugValidator.parse('titreSatelliteSlug'),
        titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        titulaireId: entrepriseId2,
        perimetreEnCommun: perimetre,
      },
    ]}
  />
)

export const WithError: StoryFn = () => (
  <ResultatMiseEnConcurrence
    initTab="carte"
    initDate={toCaminoDate('2024-10-16')}
    entreprises={entreprises}
    apiClient={{
      getEtapesTypesEtapesStatuts() {
        return Promise.resolve({ message: "Message d'erreur" })
      },
      etapeCreer(etape) {
        etapeCreerAction(etape)
        return Promise.resolve(etapeIdValidator.parse('etapeId'))
      },
    }}
    pivot={{
      demarcheId,
      demarcheTypeId: 'oct',
      titreNom: 'Pivot',
      titreSlug: titreSlugValidator.parse('titrePivotSlug'),
      titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
      titulaireId: entrepriseId1,
      perimetreSansSatellite: perimetre,
      perimetreTotal: perimetre,
    }}
    satellites={[
      {
        demarcheId: demarcheIdValidator.parse('idSatellite'),
        demarcheTypeId: 'oct',
        titreNom: 'Satellite',
        titreSlug: titreSlugValidator.parse('titreSatelliteSlug'),
        titreTypeId: TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        titulaireId: entrepriseId2,
        perimetreEnCommun: perimetre,
      },
    ]}
  />
)
