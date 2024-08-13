import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { Props, PureEtapeEdition } from './etape-edition'
import { EntrepriseDocumentId, EntrepriseId, EtapeEntrepriseDocument, entrepriseDocumentIdValidator, entrepriseIdValidator, toEntrepriseDocumentId } from 'camino-common/src/entreprise'
import { DemarcheId, demarcheIdOrSlugValidator, demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON, EtapeId, etapeDocumentIdValidator, etapeIdOrSlugValidator, etapeIdValidator, etapeSlugValidator } from 'camino-common/src/etape'
import { titreIdValidator, titreSlugValidator } from 'camino-common/src/validators/titres'
import { FeatureMultiPolygon, PerimetreInformations } from 'camino-common/src/perimetre'
import { CaminoDate, caminoDateValidator, toCaminoDate } from 'camino-common/src/date'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { UiEntrepriseDocumentInput } from './entreprise/entreprise-api-client'
import { demarcheTypeIdValidator } from 'camino-common/src/static/demarchesTypes'
import { FlattenEtape } from 'camino-common/src/etape-form'
import { tempDocumentNameValidator, TempDocumentName } from 'camino-common/src/document'

const meta: Meta = {
  title: 'Components/EtapeEdition',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: PureEtapeEdition,
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
const getEtapeDocumentsByEtapeIdAction = action('getEtapeDocumentsByEtapeId')
const getEtapeEntrepriseDocumentsAction = action('getEtapeEntrepriseDocuments')
const creerEntrepriseDocumentAction = action('creerEntrepriseDocument')
const goToDemarcheAction = action('goToDemarche')
const etapeCreerAction = action('etapeCreer')
const etapeModifierAction = action('etapeModifier')
const getEtapeAvisByEtapeIdAction = action('getEtapeAvisByEtapeId')
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
  communes: [],
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
      { etapeTypeId: 'mdp', etapeStatutId: 'fai', mainStep: true },
      { etapeTypeId: 'mod', etapeStatutId: 'fai', mainStep: true },
    ])
  },
  getEtapeHeritagePotentiel(etape, titreDemarcheId) {
    getEtapeHeritagePotentielAction(etape, titreDemarcheId)
    return Promise.resolve({
      heritageProps: {
        duree: {
          actif: false,
          etape: {
            date: toCaminoDate('2022-01-01'),
            typeId: 'mfr',
            duree: 12,
          },
        },
        substances: {
          value: ['arge'],
          actif: true,
          etape: {
            date: toCaminoDate('2022-01-01'),
            typeId: 'mfr',
            substances: ['arge'],
          },
        },
        dateDebut: { actif: false, etape: null },
        titulaires: { actif: false, etape: null },
        amodiataires: { actif: false, etape: null },
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
  getEtape(etapeIdOrSlug) {
    getEtapeAction(etapeIdOrSlug)
    const demarcheId = demarcheIdValidator.parse('demarche-id')
    return Promise.resolve({
      etape: {
        id: etapeIdValidator.parse('etape-id'),
        slug: etapeSlugValidator.parse('etape-slug'),
        typeId: 'mfr',
        statutId: 'fai',
        isBrouillon: ETAPE_IS_NOT_BROUILLON,
        titreDemarcheId: demarcheId,
        date: caminoDateValidator.parse('2023-02-01'),
        dateDebut: { value: null, heritee: false, etapeHeritee: null },
        dateFin: { value: null, heritee: false, etapeHeritee: null },
        duree: { value: null, heritee: false, etapeHeritee: null },
        substances: { value: [], heritee: false, etapeHeritee: null },
        titulaires: { value: [], heritee: false, etapeHeritee: null },
        amodiataires: { value: [], heritee: false, etapeHeritee: null },
        perimetre: {
          value: {
            geojson4326Forages: null,
            geojson4326Perimetre: null,
            geojson4326Points: null,
            geojsonOrigineForages: null,
            geojsonOrigineGeoSystemeId: null,
            geojsonOriginePerimetre: null,
            geojsonOriginePoints: null,
            surface: null,
          },
          heritee: false,
          etapeHeritee: null,
        },
        contenu: { arm: { mecanise: { value: null, heritee: false, etapeHeritee: null }, franchissements: { value: null, heritee: false, etapeHeritee: null } } },
        note: { valeur: '', is_avertissement: false },
      },
      demarche: {
        demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
        demarche_type_id: 'oct',
        demarche_description: 'Super description',
        demarche_id: demarcheId,

        titre_id: titreIdValidator.parse('titre-id'),
        titre_slug: titreSlugValidator.parse('titre-slug'),
        titre_nom: 'Nom du titre',
        titre_type_id: 'arm',
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
        const demarcheId = demarcheIdValidator.parse('demarche-id')
        return Promise.resolve({
          etape: {
            id: etapeIdValidator.parse('etape-id'),
            slug: etapeSlugValidator.parse('etape-slug'),
            typeId: 'mfr',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_BROUILLON,
            titreDemarcheId: demarcheId,
            date: caminoDateValidator.parse('2023-02-01'),
            dateDebut: { value: null, heritee: false, etapeHeritee: null },
            dateFin: { value: null, heritee: false, etapeHeritee: null },
            duree: { value: null, heritee: false, etapeHeritee: null },
            substances: { value: [], heritee: false, etapeHeritee: null },
            titulaires: { value: [], heritee: false, etapeHeritee: null },
            amodiataires: { value: [], heritee: false, etapeHeritee: null },
            contenu: { arm: { mecanise: { value: null, heritee: false, etapeHeritee: null }, franchissements: { value: null, heritee: false, etapeHeritee: null } } },
            note: { valeur: '', is_avertissement: false },
            perimetre: {
              value: {
                geojson4326Forages: null,
                geojson4326Perimetre: null,
                geojson4326Points: null,
                geojsonOrigineForages: null,
                geojsonOrigineGeoSystemeId: null,
                geojsonOriginePerimetre: null,
                geojsonOriginePoints: null,
                surface: null,
              },
              heritee: false,
              etapeHeritee: null,
            },
            heritageContenu: {},
          },
          demarche: {
            demarche_id: demarcheId,
            demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
            demarche_type_id: 'oct',
            demarche_description: 'Super description',
            titre_id: titreIdValidator.parse('titre-id'),
            titre_slug: titreSlugValidator.parse('titre-slug'),
            titre_nom: 'Nom du titre',
            titre_type_id: 'arm',
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
      getEtapeHeritagePotentiel(etape, titreDemarcheId) {
        getEtapeHeritagePotentielAction(etape, titreDemarcheId)

        return Promise.resolve({
          heritageProps: {
            dateDebut: { actif: false, etape: null },
            dateFin: { actif: false, etape: null },
            duree: { actif: false, etape: null },
            substances: { actif: false, etape: null },
            titulaires: { actif: false, etape: null },
            amodiataires: { actif: false, etape: null },
            perimetre: {
              actif: false,
              etape: null,
            },
          },
          heritageContenu: { arm: { mecanise: { actif: false }, franchissements: { actif: false } } },
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
      getEtapeDocumentsByEtapeId(etapeId: EtapeId) {
        getEtapeDocumentsByEtapeIdAction(etapeId)

        return Promise.resolve({
          etapeDocuments: [
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
          ],
          dae: null,
          asl: null,
        })
      },
      getEtape(etapeIdOrSlug) {
        getEtapeAction(etapeIdOrSlug)
        const demarcheId = demarcheIdValidator.parse('demarche-id')
        return Promise.resolve({
          etape: {
            id: etapeIdValidator.parse('etape-id'),
            slug: etapeSlugValidator.parse('etape-slug'),
            typeId: 'mfr',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_BROUILLON,
            titreDemarcheId: demarcheId,
            date: caminoDateValidator.parse('2023-02-01'),
            dateDebut: { value: null, heritee: false, etapeHeritee: null },
            dateFin: { value: null, heritee: false, etapeHeritee: null },
            duree: { value: 6, heritee: false, etapeHeritee: null },
            substances: { value: ['arge'], heritee: false, etapeHeritee: null },
            titulaires: { value: [entreprises[0].id], heritee: false, etapeHeritee: null },
            amodiataires: { value: [], heritee: false, etapeHeritee: null },
            contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null }, franchissements: { value: 9, heritee: false, etapeHeritee: null } } },
            note: { valeur: '', is_avertissement: false },
            perimetre: {
              value: {
                geojson4326Forages: null,
                geojson4326Perimetre: perimetre,
                geojson4326Points: null,
                geojsonOrigineForages: null,
                geojsonOrigineGeoSystemeId: '4326',
                geojsonOriginePerimetre: perimetre,
                geojsonOriginePoints: null,
                surface: null,
              },
              heritee: false,
              etapeHeritee: null,
            },
            heritageContenu: {},
          },
          demarche: {
            demarche_id: demarcheId,
            demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
            demarche_type_id: 'oct',
            demarche_description: 'Super description',
            titre_id: titreIdValidator.parse('titre-id'),
            titre_slug: titreSlugValidator.parse('titre-slug'),
            titre_nom: 'Nom du titre',
            titre_type_id: 'arm',
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

const modHeritageProps: Pick<FlattenEtape, 'dateDebut' | 'dateFin' | 'duree' | 'substances' | 'titulaires' | 'perimetre'> = {
  dateDebut: {
    value: toCaminoDate('2021-01-01'),
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: toCaminoDate('2021-01-01'),
    },
  },
  dateFin: {
    value: toCaminoDate('2022-01-01'),
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: toCaminoDate('2022-01-01'),
    },
  },
  duree: {
    value: 12,
    heritee: true,
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
  titulaires: {
    value: [entreprises[0].id],
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: [entreprises[0].id],
    },
  },
  perimetre: {
    value: {
      geojson4326Forages: null,
      geojson4326Perimetre: perimetre,
      geojson4326Points: null,
      geojsonOrigineForages: null,
      geojsonOrigineGeoSystemeId: '4326',
      geojsonOriginePerimetre: perimetre,
      geojsonOriginePoints: null,
      surface: null,
    },
    heritee: true,
    etapeHeritee: {
      date: toCaminoDate('2022-01-01'),
      etapeTypeId: 'mfr',
      value: {
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
  },
}

export const ModificationDemandeHeritee: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapeHeritagePotentiel(etape, titreDemarcheId) {
        getEtapeHeritagePotentielAction(etape, titreDemarcheId)

        return Promise.reject(new Error("Cet appel ne doit être fait que lors de la création de l'étape ou pour la modification de la date"))
      },
      getEtape(etapeIdOrSlug) {
        getEtapeAction(etapeIdOrSlug)

        return Promise.resolve({
          etape: {
            id: etapeIdValidator.parse('etape-id'),
            slug: etapeSlugValidator.parse('etape-slug'),
            typeId: 'mod',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_NOT_BROUILLON,
            titreDemarcheId: demarcheIdValidator.parse('demarche-id'),
            date: caminoDateValidator.parse('2023-02-01'),
            contenu: {
              arm: {
                mecanise: {
                  value: true,
                  heritee: true,
                  etapeHeritee: {
                    date: toCaminoDate('2022-01-01'),
                    etapeTypeId: 'mfr',
                    value: true,
                  },
                },
                franchissements: {
                  value: 2,
                  heritee: true,
                  etapeHeritee: {
                    date: toCaminoDate('2022-01-01'),
                    etapeTypeId: 'mfr',
                    value: 2,
                  },
                },
              },
            },
            note: { valeur: '', is_avertissement: false },
            ...modHeritageProps,
            amodiataires: {
              value: [],
              heritee: false,
              etapeHeritee: null,
            },
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
          },
          demarche: {
            demarche_id: demarcheIdValidator.parse('demarche-id'),
            demarche_type_id: demarcheTypeIdValidator.parse('oct'),
            demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
            demarche_description: 'Super description',
            titre_id: titreIdValidator.parse('titre-id'),
            titre_slug: titreSlugValidator.parse('titre-slug'),
            titre_nom: 'Nom du titre',
            titre_type_id: 'arm',
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

export const AxmEnZoneDuSdom: StoryFn = () => (
  <PureEtapeEdition
    goToDemarche={goToDemarcheAction}
    entreprises={entreprises}
    apiClient={{
      ...apiClient,
      getEtapeHeritagePotentiel(etape, titreDemarcheId) {
        getEtapeHeritagePotentielAction(etape, titreDemarcheId)

        return Promise.resolve({
          heritageProps: {
            dateDebut: {
              actif: false,
              etape: null,
            },
            dateFin: {
              actif: false,
              etape: null,
            },
            duree: {
              actif: false,
              etape: null,
            },
            substances: {
              actif: false,
              etape: null,
            },
            titulaires: {
              actif: false,
              etape: null,
            },
            amodiataires: {
              actif: false,
              etape: null,
            },
            perimetre: {
              actif: false,
              etape: null,
            },
          },
          heritageContenu: {},
        })
      },
      getEtape(etapeIdOrSlug) {
        getEtapeAction(etapeIdOrSlug)

        return Promise.resolve({
          etape: {
            id: etapeIdValidator.parse('etape-id'),
            slug: etapeSlugValidator.parse('etape-slug'),
            typeId: 'mfr',
            statutId: 'fai',
            isBrouillon: ETAPE_IS_BROUILLON,
            titreDemarcheId: demarcheIdValidator.parse('demarche-id'),
            date: caminoDateValidator.parse('2023-02-01'),
            dateDebut: {
              value: null,
              heritee: false,
              etapeHeritee: null,
            },
            dateFin: {
              value: null,
              heritee: false,
              etapeHeritee: null,
            },
            duree: {
              value: 6,
              heritee: false,
              etapeHeritee: null,
            },
            substances: {
              value: [],
              heritee: false,
              etapeHeritee: null,
            },
            titulaires: {
              value: [],
              heritee: false,
              etapeHeritee: null,
            },
            amodiataires: {
              value: [],
              heritee: false,
              etapeHeritee: null,
            },
            perimetre: {
              value: {
                geojson4326Forages: null,
                geojson4326Perimetre: null,
                geojson4326Points: null,
                geojsonOrigineForages: null,
                geojsonOrigineGeoSystemeId: null,
                geojsonOriginePerimetre: null,
                geojsonOriginePoints: null,
                surface: null,
              },
              heritee: false,
              etapeHeritee: null,
            },
            contenu: {},
            note: { valeur: '', is_avertissement: false },
            heritageContenu: {},
          },
          demarche: {
            demarche_id: demarcheIdValidator.parse('demarche-id'),
            demarche_type_id: demarcheTypeIdValidator.parse('oct'),
            demarche_slug: demarcheSlugValidator.parse('demarche-slug'),
            demarche_description: 'Super description',
            titre_id: titreIdValidator.parse('titre-id'),
            titre_slug: titreSlugValidator.parse('titre-slug'),
            titre_nom: 'Nom du titre',
            titre_type_id: 'axm',
          },
        })
      },
    }}
    user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [entrepriseIdValidator.parse('entrepriseID')] }}
    initTab="points"
    demarcheIdOrSlug={null}
    etapeIdOrSlug={etapeIdOrSlugValidator.parse('etape-id')}
  />
)
