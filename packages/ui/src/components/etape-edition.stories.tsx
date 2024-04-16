import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { vueRouter } from 'storybook-vue3-router'
import { Props, PureEtapeEdition } from './etape-edition'
import { EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator, toEntrepriseDocumentId } from 'camino-common/src/entreprise'
import { DemarcheId, demarcheIdOrSlugValidator, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { EtapeDocument, EtapeId, EtapeWithHeritage, etapeDocumentIdValidator, etapeIdOrSlugValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { FeatureMultiPolygon, PerimetreInformations } from 'camino-common/src/perimetre'
import { CaminoDate, caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { tempDocumentNameValidator, TempDocumentName } from 'camino-common/src/document'
import { UiEntrepriseDocumentInput } from './entreprise/entreprise-api-client'

const meta: Meta = {
  title: 'Components/EtapeEdition',
  // @ts-ignore
  component: PureEtapeEdition,
  decorators: [vueRouter([{ name: 'titre' }])],
}
export default meta

const getEtapeAction = action('getEtape')
const deposeEtapeAction = action('deposeEtape')
const getEtapeHeritagePotentielAction = action('getEtapeHeritagePotentiel')
const getDemarcheByIdOrSlugAction = action('getDemarcheByIdOrSlug')
const getPerimetreInfosByDemarcheIdAction = action('getPerimetreInfosByDemarcheId')
const getPerimetreInfosByEtapeIdAction = action('getPerimetreInfosByEtapeId')
const getEtapesTypesEtapesStatutsAction = action('getEtapesTypesEtapesStatuts')
const geojsonImportAction = action('geojsonImport')
const uploadTempDocumentAction = action('uploadTempDocument')
const getGeojsonByGeoSystemeIdAction = action('getGeojsonByGeoSystemeId')
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const goToDemarcheAction = action('goToDemarche')
const etapeCreerAction = action('etapeCreer')
const etapeModifierAction = action('etapeModifier')

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

const heritageProps: EtapeWithHeritage['heritageProps'] = {
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
    actif: false,
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

const apiClient: Props['apiClient'] = {
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
  getEntrepriseDocuments(id) {
    return Promise.resolve([
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jct', 'ueoau'),
        description: '',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'jct',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-03'), 'atf', 'ueoau'),
        description: "Attestation sur l'honneur",
        date: toCaminoDate('2023-06-03'),
        entreprise_document_type_id: 'atf',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'cur', 'ueoau'),
        description: 'Jon. Doe',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'cur',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'eaoueo'),
        description: 'Jon. Doe',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'jid',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'ueoau'),
        description: 'Arm. Strong',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'jid',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'idm', 'ueoaue'),
        description: 'Facture pelle',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'idm',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-08'), 'kbi', 'ueoau'),
        description: '',
        date: toCaminoDate('2023-06-08'),
        entreprise_document_type_id: 'kbi',
        can_delete_document: false,
        entreprise_id: id,
      },
      {
        id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jcf', 'uueoau'),
        description: '',
        date: toCaminoDate('2023-06-23'),
        entreprise_document_type_id: 'jcf',
        can_delete_document: false,
        entreprise_id: id,
      },
    ])
  },
  getEtapesTypesEtapesStatuts(demarcheId: DemarcheId, titreEtapeId: EtapeId | null, date: CaminoDate) {
    getEtapesTypesEtapesStatutsAction(demarcheId, titreEtapeId, date)

    return Promise.resolve([
      { etapeTypeId: 'mfr', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mfr', etapeStatutId: 'aco', mainStep: true },
      { etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mod', etapeStatutId: 'fai', mainStep: true },
    ])
  },
  getEtapeHeritagePotentielPotentiel(titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) {
    getEtapeHeritagePotentielAction(titreDemarcheId, date, typeId)

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
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={apiClient}
    user={{ ...testBlankUser, role: 'super' }}
    initTab="points"
    demarcheIdOrSlug={demarcheIdOrSlugValidator.parse('demarche-id')}
    etapeIdOrSlug={null}
  />
)

export const Modification: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={apiClient}
    user={null}
    demarcheIdOrSlug={null}
    initTab="points"
    etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')}
  />
)

export const AffichageAide: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
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
    }}
    user={null}
    demarcheIdOrSlug={null}
    initTab="points"
    etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')}
  />
)

export const DemandeArmComplete: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapeHeritagePotentielPotentiel(titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) {
        getEtapeHeritagePotentielAction(titreDemarcheId, date, typeId)

        return Promise.resolve({
          heritageContenu: { arm: { mecanise: { actif: false }, franchissements: { actif: false } } },
          heritageProps: {
            dateDebut: {
              actif: false,
            },
            dateFin: {
              actif: false,
            },
            duree: {
              actif: false,
            },
            substances: {
              actif: false,
            },
            titulaires: {
              actif: false,
            },
            amodiataires: {
              actif: false,
            },
            perimetre: {
              actif: false,
            },
          },
        })
      },
      getEtapeEntrepriseDocuments(etapeId: EtapeId): Promise<EtapeEntrepriseDocument[]> {
        getEtapeEntrepriseDocumentsAction(etapeId)

        const id = entreprises[0].id

        return Promise.resolve([
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jct', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jct',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-03'), 'atf', 'ueoau'),
            description: "Attestation sur l'honneur",
            date: toCaminoDate('2023-06-03'),
            entreprise_document_type_id: 'atf',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'cur', 'ueoau'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'cur',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jid', 'eaoueo'),
            description: 'Jon. Doe',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jid',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'idm', 'ueoaue'),
            description: 'Facture pelle',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'idm',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-08'), 'kbi', 'ueoau'),
            description: '',
            date: toCaminoDate('2023-06-08'),
            entreprise_document_type_id: 'kbi',
            entreprise_id: id,
          },
          {
            id: toEntrepriseDocumentId(toCaminoDate('2023-06-23'), 'jcf', 'uueoau'),
            description: '',
            date: toCaminoDate('2023-06-23'),
            entreprise_document_type_id: 'jcf',
            entreprise_id: id,
          },
        ])
      },
      getEtapeDocumentsByEtapeId(etapeId: EtapeId): Promise<EtapeDocument[]> {
        getEtapeDocumentsByEtapeIdAction(etapeId)

        return Promise.resolve([
          {
            id: etapeDocumentIdValidator.parse('id1'),
            description: null,
            etape_document_type_id: 'car',
            public_lecture: true,
            entreprises_lecture: true,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            description: null,
            etape_document_type_id: 'dep',
            public_lecture: true,
            entreprises_lecture: true,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            description: null,
            etape_document_type_id: 'doe',
            public_lecture: true,
            entreprises_lecture: true,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            description: null,
            etape_document_type_id: 'dom',
            public_lecture: true,
            entreprises_lecture: true,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            description: null,
            etape_document_type_id: 'for',
            public_lecture: true,
            entreprises_lecture: true,
          },
          {
            id: etapeDocumentIdValidator.parse('id2'),
            description: null,
            etape_document_type_id: 'jpa',
            public_lecture: true,
            entreprises_lecture: true,
          },
        ])
      },
      getEtape(etapeIdOrSlug) {
        getEtapeAction(etapeIdOrSlug)

        return Promise.resolve({
          id: etapeIdValidator.parse('etape-id'),
          slug: etapeSlugValidator.parse('etape-slug'),
          typeId: 'mfr',
          statutId: 'aco',
          titreDemarcheId: demarcheIdValidator.parse('demarche-id'),
          date: caminoDateValidator.parse('2023-02-01'),
          dateDebut: null,
          dateFin: null,
          duree: 6,
          substances: ['arge'],
          titulaires: [{ id: entreprises[0].id, operateur: false }],
          amodiataires: [],
          contenu: { arm: { mecanise: true, franchissements: 9 } },
          notes: null,
          geojson4326Forages: null,
          geojson4326Perimetre: perimetre,
          geojson4326Points: null,
          geojsonOrigineForages: null,
          geojsonOrigineGeoSystemeId: '4326',
          geojsonOriginePerimetre: perimetre,
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
    }}
    user={{ ...testBlankUser, role: 'super' }}
    initTab="points"
    demarcheIdOrSlug={null}
    etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')}
  />
)

const modHeritageProps: EtapeWithHeritage['heritageProps'] = {
  dateDebut: {
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      dateDebut: toCaminoDate('2021-01-01'),
    },
  },
  dateFin: {
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      dateFin: toCaminoDate('2022-01-01'),
    },
  },
  duree: {
    actif: true,
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
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      titulaires: [{ id: entreprises[0].id, operateur: false }],
    },
  },
  amodiataires: {
    actif: false,
  },
  perimetre: {
    actif: true,
    etape: {
      date: toCaminoDate('2022-01-01'),
      typeId: 'mfr',
      geojson4326Forages: null,
      geojson4326Perimetre: perimetre,
      geojson4326Points: null,
      geojsonOrigineForages: null,
      geojsonOrigineGeoSystemeId: '4326',
      geojsonOriginePerimetre: perimetre,
      geojsonOriginePoints: null,
      surface: null,
    },
  },
}

export const ModificationDemandeHeritee: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapeHeritagePotentielPotentiel(titreDemarcheId: DemarcheId, date: CaminoDate, typeId: EtapeTypeId) {
        getEtapeHeritagePotentielAction(titreDemarcheId, date, typeId)

        return Promise.resolve({
          heritageContenu: {
            arm: {
              mecanise: {
                actif: true,
                etape: {
                  date: toCaminoDate('2022-01-01'),
                  typeId: 'mfr',
                  contenu: { arm: { mecanise: true } },
                },
              },
              franchissements: {
                actif: true,
                etape: {
                  date: toCaminoDate('2022-01-01'),
                  typeId: 'mfr',
                  contenu: { arm: { franchissements: 2 } },
                },
              },
            },
          },
          heritageProps: modHeritageProps,
        })
      },
      getEtape(etapeIdOrSlug) {
        getEtapeAction(etapeIdOrSlug)

        return Promise.resolve({
          id: etapeIdValidator.parse('etape-id'),
          slug: etapeSlugValidator.parse('etape-slug'),
          typeId: 'mod',
          statutId: 'fai',
          titreDemarcheId: demarcheIdValidator.parse('demarche-id'),
          date: caminoDateValidator.parse('2023-02-01'),
          dateDebut: null,
          dateFin: null,
          duree: 6,
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
    }}
    user={{ ...testBlankUser, role: 'super' }}
    initTab="points"
    demarcheIdOrSlug={null}
    etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')}
  />
)

// FIXME tests avec
// - heritageContenu
// - étape en construction
// - avec du sdom
// - avec une arm mécanisé
// - demande AXM d'une entreprise (avec les 3 étapes imbriquées)
