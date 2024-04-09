import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'
import { Props, PureEtapeEdition } from './etape-edition'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'
import { demarcheIdOrSlugValidator, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { etapeIdOrSlugValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { etapeEditFormApiClient } from './etape/etape-edit-form.stories'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { PerimetreInformations } from 'camino-common/src/perimetre'
import { caminoDateValidator } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/EtapeEdition',
  // @ts-ignore
  component: PureEtapeEdition,
  decorators: [vueRouter([{ name: 'titre' }])],
}
export default meta

const getEtapeAction = action('getEtape')
const getDemarcheByIdOrSlugAction = action('getDemarcheByIdOrSlug')
const getPerimetreInfosByDemarcheIdAction = action('getPerimetreInfosByDemarcheId')
const getPerimetreInfosByEtapeIdAction = action('getPerimetreInfosByEtapeId')

const entreprises = [
  { id: entrepriseIdValidator.parse('fr-899600233'), nom: '10 A', legal_siren: '899600233' },
  { id: entrepriseIdValidator.parse('fr-529770646'), nom: '2GRE', legal_siren: '529770646' },
  { id: entrepriseIdValidator.parse('fr-895187920'), nom: '45-8 AVANT-MONTS', legal_siren: '895187920' },
  { id: entrepriseIdValidator.parse('fr-831762786'), nom: '45-8 FONTS-BOUILLANTS', legal_siren: '831762786' },
  { id: entrepriseIdValidator.parse('fr-539449124'), nom: '6EME SENS IMMOBILIER ENTREPRISES', legal_siren: '539449124' },
  { id: entrepriseIdValidator.parse('xx-100000146'), nom: '8 communes de la vallée de Vicdessos', legal_siren: null },
  { id: entrepriseIdValidator.parse('xx-97300a001'), nom: 'Aboeka Alphonse', legal_siren: null },
  { id: entrepriseIdValidator.parse('fr-523359024'), nom: 'ABOEKA METAL', legal_siren: '523359024' },
  { id: entrepriseIdValidator.parse('xx-97300a002'), nom: 'Aboeka Thomas', legal_siren: null },
  { id: entrepriseIdValidator.parse('fr-839888138'), nom: 'ABOUNAMI GOLD', legal_siren: '839888138' },
]

const perimetreInformations: PerimetreInformations = {
  sdomZoneIds: ['1'],
  superposition_alertes: [{ nom: 'Titre Tutu', slug: titreSlugValidator.parse('slug-tutu'), titre_statut_id: 'mod' }],
}

const apiClient: Props['apiClient'] = {
  ...etapeEditFormApiClient,
  getEtape(etapeIdOrSlug) {
    getEtapeAction(etapeIdOrSlug)

    return Promise.resolve({
      id: etapeIdValidator.parse('etape-id'),
      slug: etapeSlugValidator.parse('etape-slug'),
      typeId: 'mfr',
      statutId: 'fai',
      titreDemarcheId: demarcheIdValidator.parse('demarche-id'),
      date: caminoDateValidator.parse('2023-02-01'),
      dateDebut: null,
      dateFin: null,
      duree: null,
      substances: [],
      titulaires: [],
      amodiataires: [],
      contenu: {},
      notes: null,
      geojson4326Forages: null,
      geojson4326Perimetre: null,
      geojson4326Points: null,
      geojsonOrigineForages: null,
      geojsonOrigineGeoSystemeId: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      surface: null,
      demarche: {
        slug: demarcheSlugValidator.parse('demarche-slug'),
        typeId: 'oct',
        description: 'Super description',
        titre: {
          id: titreIdValidator.parse('titre-id'),
          slug: titreSlugValidator.parse('titre-slug'),
          nom: 'Nom du titre',
          typeId: 'arm',
        },
      },
    })
  },
  getDemarcheByIdOrSlug(demarcheIdOrSlug) {
    getDemarcheByIdOrSlugAction(demarcheIdOrSlug)

    return Promise.resolve({
      demarche_description: 'Super description',
      demarche_id: demarcheIdValidator.parse('demarche-id'),
      demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
      demarche_type_id: 'oct',
      titre_id: titreIdValidator.parse('titre-id'),
      titre_nom: 'Nom du titre',
      titre_slug: titreSlugValidator.parse('titre-slug'),
      titre_type_id: 'arm',
    })
  },
  getPerimetreInfosByDemarcheId(demarcheId) {
    getPerimetreInfosByDemarcheIdAction(demarcheId)

    return Promise.resolve(perimetreInformations)
  },
  getPerimetreInfosByEtapeId(etapeId) {
    getPerimetreInfosByEtapeIdAction(etapeId)

    return Promise.resolve(perimetreInformations)
  },
}

export const Creation: StoryFn = () => (
  <PureEtapeEdition entreprises={entreprises} apiClient={apiClient} user={null} demarcheIdOrSlug={demarcheIdOrSlugValidator.parse('demarche-id')} etapeIdOrSlug={null} />
)

export const Modification: StoryFn = () => (
  <PureEtapeEdition entreprises={entreprises} apiClient={apiClient} user={null} demarcheIdOrSlug={null} etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')} />
)
