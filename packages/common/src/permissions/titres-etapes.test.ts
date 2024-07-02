import { TitreTypeId } from '../static/titresTypes.js'
import { EtapeTypeId } from '../static/etapesTypes.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'

import {
  canCreateEtape,
  canEditEtape,
  canEditAmodiataires,
  canEditDates,
  canEditDuree,
  canEditTitulaires,
  isDureeOptional,
  isEtapeComplete,
  IsEtapeCompleteDocuments,
  IsEtapeCompleteEntrepriseDocuments,
  IsEtapeCompleteEtape,
  canDeleteEtape,
  canDeleteEtapeDocument,
} from './titres-etapes.js'
import { AdministrationId, ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { TestUser, testBlankUser } from '../tests-utils.js'
import { TitreStatutId } from '../static/titresStatuts.js'
import { EntrepriseId, entrepriseIdValidator, newEntrepriseId } from '../entreprise.js'
import { SubstanceLegaleId } from '../static/substancesLegales.js'
import { FeatureMultiPolygon } from '../perimetre.js'
import { caminoDateValidator, toCaminoDate } from '../date.js'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON } from '../etape.js'
import { EntrepriseUserNotNull } from '../roles.js'
import { communeIdValidator } from '../static/communes.js'
import { SDOMZoneIds } from '../static/sdom.js'

test.each<{ etapeTypeId: EtapeTypeId; demarcheTypeId: DemarcheTypeId; titreTypeId: TitreTypeId; optional: boolean }>([
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'arm', optional: false },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: false },
  { etapeTypeId: 'dex', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'prm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'dep', titreTypeId: 'arm', optional: true },
])('isDureeOptional $etapeTypeId | $demarcheTypeId | $titreTypeId | $optional', ({ etapeTypeId, demarcheTypeId, titreTypeId, optional }) => {
  expect(isDureeOptional(etapeTypeId, demarcheTypeId, titreTypeId)).toEqual(optional)
})

test.each<{ titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId; canEdit: boolean }>([
  { titreTypeId: 'arm', demarcheTypeId: 'dep', canEdit: false },
  { titreTypeId: 'arm', demarcheTypeId: 'oct', canEdit: false },
  { titreTypeId: 'arm', demarcheTypeId: 'dec', canEdit: true },
  { titreTypeId: 'arm', demarcheTypeId: 'pro', canEdit: true },
  { titreTypeId: 'axm', demarcheTypeId: 'dec', canEdit: true },
  { titreTypeId: 'prm', demarcheTypeId: 'exp', canEdit: false },
  { titreTypeId: 'prm', demarcheTypeId: 'mut', canEdit: false },
])('canEditDuree $titreTypeId | $demarcheTypeId | $canEdit', ({ titreTypeId, demarcheTypeId, canEdit }) => expect(canEditDuree(titreTypeId, demarcheTypeId)).toEqual(canEdit))

test.each<{ titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId; etapeTypeId: EtapeTypeId; user: TestUser; canEdit: boolean }>([
  { titreTypeId: 'arm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'arm', etapeTypeId: 'dpu', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'axm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dep', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'exp', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'mut', user: { role: 'super' }, canEdit: false },
])('canEditDate $titreTypeId | $demarcheTypeId | $etapeTypeId | $user | $canEdit', ({ titreTypeId, demarcheTypeId, etapeTypeId, user, canEdit }) => {
  expect(canEditDates(titreTypeId, demarcheTypeId, etapeTypeId, { ...user, ...testBlankUser })).toEqual(canEdit)
})

test.each<{ titreTypeId: TitreTypeId; user: TestUser; canEdit: boolean }>([
  { titreTypeId: 'arm', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'axm', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'prm', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'prm', user: { role: 'defaut' }, canEdit: false },
])('canEditAmodiataires $titreTypeId | $user | $canEdit', ({ titreTypeId, user, canEdit }) => {
  expect(canEditAmodiataires(titreTypeId, { ...user, ...testBlankUser })).toEqual(canEdit)
})

test.each<{ titreTypeId: TitreTypeId; user: TestUser; canEdit: boolean }>([
  { titreTypeId: 'prm', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'defaut' }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'axm', user: { role: 'defaut' }, canEdit: false },
  { titreTypeId: 'arm', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'arm', user: { role: 'defaut' }, canEdit: false },
])('canEditTitulaires $titreTypeId | $user | $canEdit', ({ titreTypeId, user, canEdit }) => {
  expect(canEditTitulaires(titreTypeId, { ...user, ...testBlankUser })).toEqual(canEdit)
})

test.each<{
  user: TestUser
  etapeTypeId: EtapeTypeId
  isBrouillon: boolean
  titreTitulaires: EntrepriseId[]
  titresAdministrationsLocales: AdministrationId[]
  demarcheTypeId: DemarcheTypeId
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
  canCreate: boolean
}>([
  {
    user: { role: 'super' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'defaut' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [newEntrepriseId('1')],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_BROUILLON,
    titreTitulaires: [newEntrepriseId('1')],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'admin', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['DGCL/SDFLAE/FL1'] },
    etapeTypeId: 'mfr',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'] },
    etapeTypeId: 'aca',
    isBrouillon: ETAPE_IS_NOT_BROUILLON,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
])(
  'canCreateEtape $user | $etapeTypeId | $etapeStatutId | $titreTitulaires | $titresAdministrationsLocales | $demarcheTypeId | $titre | $canCreate',
  ({ user, etapeTypeId, isBrouillon, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre, canCreate }) => {
    expect(canCreateEtape({ ...user, ...testBlankUser }, etapeTypeId, isBrouillon, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre)).toEqual(canCreate)
  }
)

test.each<{
  administrationId: AdministrationId
  titreTypeId: TitreTypeId
  canEdit: boolean
}>([
  { administrationId: 'min-mtes-dgaln-01', titreTypeId: 'prm', canEdit: true },
  { administrationId: 'min-mtes-dgaln-01', titreTypeId: 'pxm', canEdit: true },
  { administrationId: 'min-mtes-dgaln-01', titreTypeId: 'cxm', canEdit: true },
  { administrationId: 'min-mtes-dgaln-01', titreTypeId: 'axm', canEdit: true },
  { administrationId: 'dea-guyane-01', titreTypeId: 'axm', canEdit: true },
  { administrationId: 'ope-onf-973-01', titreTypeId: 'axm', canEdit: false },
  { administrationId: 'min-mtes-dgaln-01', titreTypeId: 'arm', canEdit: true },
  { administrationId: 'ope-onf-973-01', titreTypeId: 'arm', canEdit: true },
])('un utilisateur admin d’une administration peut modifier une étape mcr sur un titre: $canEdit', ({ administrationId, titreTypeId, canEdit }) => {
  expect(canEditEtape({ role: 'admin', administrationId, ...testBlankUser }, 'mcr', false, [], [], 'oct', { typeId: titreTypeId, titreStatutId: 'val' })).toBe(canEdit)
})

test('une entreprise peut modifier sa demande mais ne peut pas la supprimer', () => {
  const user: EntrepriseUserNotNull = { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('entrepriseId') }] }
  expect(canEditEtape(user, 'mfr', true, [user.entreprises[0].id], [], 'oct', { typeId: 'arm', titreStatutId: 'ind' })).toBe(true)
  expect(canDeleteEtape(user, 'mfr', true, [user.entreprises[0].id], [], 'oct', { typeId: 'arm', titreStatutId: 'ind' })).toBe(false)
})

const multiPolygonWith4Points: FeatureMultiPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [1, 2],
          [1, 2],
          [1, 2],
          [1, 2],
        ],
      ],
    ],
  },
}

const titulaireId = entrepriseIdValidator.parse('titulaireId')
const etapeComplete: IsEtapeCompleteEtape = {
  contenu: {},
  date: caminoDateValidator.parse('2023-02-01'),
  typeId: 'mfr',
  statutId: 'fai',
  substances: { value: ['auru'], heritee: false, etapeHeritee: null },
  titulaires: { value: [titulaireId], heritee: false, etapeHeritee: null },
  amodiataires: { value: [], heritee: false, etapeHeritee: null },
  perimetre: {
    value: {
      geojson4326Perimetre: multiPolygonWith4Points,
      geojson4326Points: null,
      geojsonOriginePerimetre: null,
      geojsonOriginePoints: null,
      geojsonOrigineGeoSystemeId: null,
      geojson4326Forages: null,
      geojsonOrigineForages: null,
      surface: null,
    },
    heritee: false,
    etapeHeritee: null,
  },
  duree: { value: 4, heritee: false, etapeHeritee: null },
  isBrouillon: ETAPE_IS_NOT_BROUILLON,
}

const armDocuments: IsEtapeCompleteDocuments = [{ etape_document_type_id: 'car' }, { etape_document_type_id: 'dom' }, { etape_document_type_id: 'for' }, { etape_document_type_id: 'jpa' }]
const armEntrepriseDocuments: IsEtapeCompleteEntrepriseDocuments = [
  { entreprise_document_type_id: 'cur', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jid', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jct', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'kbi', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jcf', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'atf', entreprise_id: titulaireId },
]

const axmDocuments: IsEtapeCompleteDocuments = [
  { etape_document_type_id: 'car' },
  { etape_document_type_id: 'lem' },
  { etape_document_type_id: 'idm' },
  { etape_document_type_id: 'mes' },
  { etape_document_type_id: 'met' },
  { etape_document_type_id: 'sch' },
  { etape_document_type_id: 'prg' },
]

const axmEntrepriseDocuments: IsEtapeCompleteEntrepriseDocuments = [
  { entreprise_document_type_id: 'lis', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jac', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'bil', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'ref', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'deb', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'atf', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jid', entreprise_id: titulaireId },
  { entreprise_document_type_id: 'jct', entreprise_id: titulaireId },
]

test('teste la complétude d’une demande d’AXM faite par un utilisateur entreprises en Guyane en Zone1 du SDOM', () => {
  expect(
    isEtapeComplete(
      { ...etapeComplete, isBrouillon: ETAPE_IS_BROUILLON },
      'axm',
      'oct',
      axmDocuments,
      axmEntrepriseDocuments,
      [SDOMZoneIds.Zone1],
      [communeIdValidator.parse('97302')],
      { arrete_prefectoral: '', date: toCaminoDate('2024-01-01'), description: null, entreprises_lecture: true, etape_document_type_id: 'arp', etape_statut_id: 'fai', public_lecture: true },
      { date: toCaminoDate('2024-04-22'), description: null, entreprises_lecture: true, etape_document_type_id: 'let', etape_statut_id: 'fai', public_lecture: true },
      [],
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('id1') }] }
    )
  ).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Notice d’impact" (nip) est obligatoire",
      ],
      "valid": false,
    }
  `)
})

test('teste la complétude d’une demande d’AXM faite par un utilisateur entreprises', () => {
  expect(
    isEtapeComplete(
      { ...etapeComplete, isBrouillon: ETAPE_IS_BROUILLON },
      'axm',
      'oct',
      axmDocuments,
      axmEntrepriseDocuments,
      [],
      [],
      { arrete_prefectoral: '', date: toCaminoDate('2024-01-01'), description: null, entreprises_lecture: true, etape_document_type_id: 'arp', etape_statut_id: 'fai', public_lecture: true },
      { date: toCaminoDate('2024-04-22'), description: null, entreprises_lecture: true, etape_document_type_id: 'let', etape_statut_id: 'fai', public_lecture: true },
      [],
      { ...testBlankUser, role: 'entreprise', entreprises: [{ id: entrepriseIdValidator.parse('id1') }] }
    )
  ).toStrictEqual({ valid: true })
})

test('teste la complétude d’une demande d’ARM', () => {
  expect(
    isEtapeComplete(
      { ...etapeComplete, contenu: { arm: { mecanise: { value: false, etapeHeritee: null, heritee: false } } } },
      'arm',
      'oct',
      armDocuments,
      armEntrepriseDocuments,
      [],
      [],
      null,
      null,
      [],
      { ...testBlankUser, role: 'super' }
    )
  ).toStrictEqual({ valid: true })
})

test.each<[SubstanceLegaleId[], EtapeTypeId, TitreTypeId, IsEtapeCompleteDocuments, IsEtapeCompleteEntrepriseDocuments]>([
  [[], 'rde', 'arm', armDocuments, []],
  [['auru'], 'mfr', 'arm', armDocuments, armEntrepriseDocuments],
  [['auru'], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments],
])('teste la complétude des substances complètes %#', (substances, etapeType, titreType, testDocuments, entrepriseDocuments) => {
  const titreEtape: IsEtapeCompleteEtape = {
    ...etapeComplete,
    substances: { value: substances, heritee: false, etapeHeritee: null },
    contenu: { arm: { mecanise: { value: false, etapeHeritee: null, heritee: false } } },
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', testDocuments, entrepriseDocuments, [], [], null, null, [], { ...testBlankUser, role: 'super' })

  expect(result.valid, JSON.stringify(result)).toBe(true)
})

test.each<[SubstanceLegaleId[], EtapeTypeId, TitreTypeId, IsEtapeCompleteDocuments, IsEtapeCompleteEntrepriseDocuments]>([
  [[], 'mfr', 'arm', armDocuments, armEntrepriseDocuments],
  [[], 'mfr', 'axm', armDocuments, armEntrepriseDocuments],
  [[], 'mfr', 'prm', armDocuments, armEntrepriseDocuments],
  [[], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments],
])('teste la complétude des substances incomplètes %#', (substances, etapeType, titreType, testDocuments, entrepriseDocuments) => {
  const titreEtape: IsEtapeCompleteEtape = {
    ...etapeComplete,
    substances: { value: substances, heritee: false, etapeHeritee: null },
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', testDocuments, entrepriseDocuments, [], [], null, null, [], { ...testBlankUser, role: 'super' })

  const errorLabel = 'Les substances sont obligatoires'
  expect(result.valid).toBe(false)
  if (!result.valid) {
    expect(result.errors, JSON.stringify(result)).toContain(errorLabel)
  } else {
    throw new Error('')
  }
})

test.each<[FeatureMultiPolygon | null, EtapeTypeId, TitreTypeId, IsEtapeCompleteDocuments, IsEtapeCompleteEntrepriseDocuments]>([
  [null, 'mfr', 'arm', armDocuments, armEntrepriseDocuments],
  [null, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments],
  [null, 'mfr', 'prm', [], []],
])('teste la complétude du périmètre incomplet %#', (geojson4326Perimetre, etapeType, titreType, documents, entrepriseDocuments) => {
  const titreEtape: IsEtapeCompleteEtape = {
    ...etapeComplete,
    perimetre: {
      value: {
        geojson4326Points: null,
        geojsonOriginePerimetre: null,
        geojsonOriginePoints: null,
        geojsonOrigineGeoSystemeId: null,
        geojson4326Forages: null,
        geojsonOrigineForages: null,
        surface: null,
        geojson4326Perimetre,
      },
      heritee: false,
      etapeHeritee: null,
    },
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', documents, entrepriseDocuments, [], [], null, null, [], { ...testBlankUser, role: 'super' })

  const errorLabel = 'Le périmètre est obligatoire'
  expect(result.valid).toBe(false)
  if (!result.valid) {
    expect(result.errors, JSON.stringify(result)).toContain(errorLabel)
  } else {
    throw new Error('')
  }
})
test.each<[FeatureMultiPolygon | null, EtapeTypeId, TitreTypeId, IsEtapeCompleteDocuments, IsEtapeCompleteEntrepriseDocuments]>([
  [null, 'rde', 'arm', armDocuments, []],
  [multiPolygonWith4Points, 'mfr', 'arm', armDocuments, armEntrepriseDocuments],
  [multiPolygonWith4Points, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments],
])('teste la complétude du périmètre complet %#', (geojson4326Perimetre, etapeType, titreType, documents, entrepriseDocuments) => {
  const titreEtape: IsEtapeCompleteEtape = {
    ...etapeComplete,
    contenu: titreType === 'arm' ? { arm: { mecanise: { value: false, heritee: false, etapeHeritee: null } } } : {},
    perimetre: {
      value: {
        geojson4326Points: null,
        geojsonOriginePerimetre: null,
        geojsonOriginePoints: null,
        geojsonOrigineGeoSystemeId: null,
        geojson4326Forages: null,
        geojsonOrigineForages: null,
        surface: null,
        geojson4326Perimetre,
      },
      heritee: false,
      etapeHeritee: null,
    },
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', documents, entrepriseDocuments, [], [], null, null, [], { ...testBlankUser, role: 'super' })

  expect(result).toStrictEqual({ valid: true })
})

test('une demande d’ARM mécanisée a des documents obligatoires supplémentaires', () => {
  const errors = isEtapeComplete(
    { ...etapeComplete, contenu: { arm: { mecanise: { value: true, heritee: false, etapeHeritee: null } } } },
    'arm',
    'oct',
    armDocuments,
    armEntrepriseDocuments,
    [],
    [],
    null,
    null,
    [],
    { ...testBlankUser, role: 'super' }
  )
  expect(errors).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document "Décision cas par cas" (dep) est obligatoire",
        "le document "Dossier "Loi sur l'eau"" (doe) est obligatoire",
      ],
      "valid": false,
    }
  `)
})

test.each<[number | null, EtapeTypeId, TitreTypeId, IsEtapeCompleteDocuments, IsEtapeCompleteEntrepriseDocuments, boolean]>([
  [null, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
  [0, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
  [0, 'mfr', 'arm', armDocuments, armEntrepriseDocuments, true],
  [0, 'mfr', 'prm', armDocuments, armEntrepriseDocuments, false],
  [0, 'rde', 'arm', [], [], false],
  [3, 'mfr', 'arm', armDocuments, armEntrepriseDocuments, false],
  [3, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, false],
])('%# teste la complétude de la durée %s pour une étapeType %s, un titreType %s', (duree, etapeType, titreType, documents, entreprisedocuments, error) => {
  const titreEtape: IsEtapeCompleteEtape = {
    ...etapeComplete,
    duree: { value: duree, heritee: false, etapeHeritee: null },
    contenu: { arm: { mecanise: { value: false, heritee: false, etapeHeritee: null } } },
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', documents, entreprisedocuments, [], [], null, null, [], { ...testBlankUser, role: 'super' })

  const errorLabel = 'la durée est obligatoire'
  if (error) {
    if (!result.valid) {
      expect(result.errors).toContain(errorLabel)
    } else {
      throw new Error('test valide alors que non')
    }
  } else {
    expect(result).toStrictEqual({ valid: true })
  }
})

test('canDeleteEtapeDocument', () => {
  expect(canDeleteEtapeDocument(ETAPE_IS_BROUILLON, { ...testBlankUser, role: 'defaut' })).toBe(true)
  expect(canDeleteEtapeDocument(ETAPE_IS_NOT_BROUILLON, { ...testBlankUser, role: 'defaut' })).toBe(false)
  expect(canDeleteEtapeDocument(ETAPE_IS_NOT_BROUILLON, { ...testBlankUser, role: 'super' })).toBe(true)
})
