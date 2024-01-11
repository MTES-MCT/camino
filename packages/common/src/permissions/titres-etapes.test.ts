import { TitreTypeId } from '../static/titresTypes.js'
import { EtapeTypeId } from '../static/etapesTypes.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { canCreateEtape, canEditEtape, canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, dureeOptionalCheck, isEtapeComplete } from './titres-etapes.js'
import { AdministrationId, ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { TestUser, testBlankUser } from '../tests-utils.js'
import { TitreStatutId } from '../static/titresStatuts.js'
import { EntrepriseId, newEntrepriseId } from '../entreprise.js'
import { EtapeStatutId } from '../static/etapesStatuts.js'
import { SubstanceLegaleId } from '../static/substancesLegales.js'

test.each<{ etapeTypeId: EtapeTypeId; demarcheTypeId: DemarcheTypeId; titreTypeId: TitreTypeId; optional: boolean }>([
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'arm', optional: false },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: false },
  { etapeTypeId: 'dex', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'prm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'dep', titreTypeId: 'arm', optional: true },
])('dureeOptionalCheck $etapeTypeId | $demarcheTypeId | $titreTypeId | $optional', ({ etapeTypeId, demarcheTypeId, titreTypeId, optional }) => {
  expect(dureeOptionalCheck(etapeTypeId, demarcheTypeId, titreTypeId)).toEqual(optional)
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
  etapeStatutId: EtapeStatutId | null
  titreTitulaires: { id: EntrepriseId }[]
  titresAdministrationsLocales: AdministrationId[]
  demarcheTypeId: DemarcheTypeId
  titre: { typeId: TitreTypeId; titreStatutId: TitreStatutId }
  canCreate: boolean
}>([
  {
    user: { role: 'super' },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'defaut' },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [{ id: newEntrepriseId('1') }],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'ren',
    titre: { typeId: 'apc', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'entreprise', entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [{ id: newEntrepriseId('1') }],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'admin', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: true,
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'] },
    etapeTypeId: 'aca',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', titreStatutId: 'dmc' },
    canCreate: false,
  },
])(
  'canCreateEtape $user | $etapeTypeId | $etapeStatutId | $titreTitulaires | $titresAdministrationsLocales | $demarcheTypeId | $titre | $canCreate',
  ({ user, etapeTypeId, etapeStatutId, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre, canCreate }) => {
    expect(canCreateEtape({ ...user, ...testBlankUser }, etapeTypeId, etapeStatutId, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre)).toEqual(canCreate)
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
  expect(canEditEtape({ role: 'admin', administrationId, ...testBlankUser }, 'mcr', 'fai', [], [], 'oct', { typeId: titreTypeId, titreStatutId: 'val' })).toBe(canEdit)
})

const etapeComplete: Parameters<typeof isEtapeComplete>[0] = {
  typeId: 'mfr',
  substances: ['auru'],
  points: [{}, {}, {}, {}],
  duree: 4,
}

const armDocuments: Parameters<typeof isEtapeComplete>[3] = [
  { typeId: 'car', fichier: true },
  { typeId: 'dom', fichier: true },
  { typeId: 'for', fichier: true },
  { typeId: 'jpa', fichier: true },
]
const armEntrepriseDocuments: Parameters<typeof isEtapeComplete>[4] = [
  { entreprise_document_type_id: 'cur' },
  { entreprise_document_type_id: 'jid' },
  { entreprise_document_type_id: 'jct' },
  { entreprise_document_type_id: 'kbi' },
  { entreprise_document_type_id: 'jcf' },
  { entreprise_document_type_id: 'atf' },
]

const axmDocuments: Parameters<typeof isEtapeComplete>[3] = [
  { typeId: 'car', fichier: true },
  { typeId: 'lem', fichier: true },
  { typeId: 'idm', fichier: true },
  { typeId: 'mes', fichier: true },
  { typeId: 'met', fichier: true },
  { typeId: 'sch', fichier: true },
  { typeId: 'prg', fichier: true },
]

const axmEntrepriseDocuments: Parameters<typeof isEtapeComplete>[4] = [
  { entreprise_document_type_id: 'lis' },
  { entreprise_document_type_id: 'jac' },
  { entreprise_document_type_id: 'bil' },
  { entreprise_document_type_id: 'ref' },
  { entreprise_document_type_id: 'deb' },
  { entreprise_document_type_id: 'atf' },
  { entreprise_document_type_id: 'jid' },
  { entreprise_document_type_id: 'jct' },
]

test('teste la complétude d’une demande d’ARM', () => {
  expect(isEtapeComplete(etapeComplete, 'arm', 'oct', armDocuments, armEntrepriseDocuments, [])).toStrictEqual({ valid: true })
})

test.each<[SubstanceLegaleId[], EtapeTypeId, TitreTypeId, Parameters<typeof isEtapeComplete>[3], Parameters<typeof isEtapeComplete>[4], boolean]>([
  [[], 'mfr', 'arm', armDocuments, armEntrepriseDocuments, true],
  [[], 'mfr', 'axm', armDocuments, armEntrepriseDocuments, true],
  [[], 'rde', 'arm', armDocuments, [], false],
  [[], 'mfr', 'prm', armDocuments, armEntrepriseDocuments, false],
  [['auru'], 'mfr', 'arm', armDocuments, armEntrepriseDocuments, false],
  [['auru'], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, false],
  [[], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
])('teste la complétude des substances', (substances, etapeType, titreType, testDocuments, entrepriseDocuments, error) => {
  const titreEtape = {
    ...etapeComplete,
    substances,
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', testDocuments, entrepriseDocuments, [])

  const errorLabel = 'au moins une substance doit être renseignée'

  if (error) {
    if (!result.valid) {
      expect(result.errors).toContain(errorLabel)
    } else {
      throw new Error('')
    }
  } else {
    expect(result).toStrictEqual({ valid: true })
  }
})

test.each<[unknown[], EtapeTypeId, TitreTypeId, Parameters<typeof isEtapeComplete>[3], Parameters<typeof isEtapeComplete>[4], boolean]>([
  [[], 'mfr', 'arm', armDocuments, armEntrepriseDocuments, true],
  [[], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
  [[], 'rde', 'arm', armDocuments, [], false],
  [[], 'mfr', 'prm', [], [], false],
  [[{}, {}, {}, {}], 'mfr', 'arm', armDocuments, armEntrepriseDocuments, false],
  [[{}, {}, {}, {}], 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, false],
  [[{}, {}, {}], 'mfr', 'axm', armDocuments, armEntrepriseDocuments, true],
])('teste la complétude du périmètre', (points, etapeType, titreType, documents, entrepriseDocuments, error) => {
  const titreEtape = {
    ...etapeComplete,
    points,
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', documents, entrepriseDocuments, [])

  const errorLabel = 'le périmètre doit comporter au moins 4 points'
  if (error) {
    if (!result.valid) {
      expect(result.errors).toContain(errorLabel)
    } else {
      throw new Error('')
    }
  } else {
    expect(result).toStrictEqual({ valid: true })
  }
})

test('[DEPRECATED] une demande d’ARM mécanisée a des documents obligatoires supplémentaires', () => {
  const errors = isEtapeComplete({ ...etapeComplete, contenu: { arm: { mecanise: true } } }, 'arm', 'oct', armDocuments, armEntrepriseDocuments, [])
  expect(errors).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document \\"dep\\" est obligatoire",
        "le document \\"doe\\" est obligatoire",
      ],
      "valid": false,
    }
  `)
})

test('une demande d’ARM mécanisée a des documents obligatoires supplémentaires', () => {
  const errors = isEtapeComplete(
    { ...etapeComplete, sectionsWithValue: [{ id: 'arm', elements: [{ id: 'mecanise', type: 'radio', value: true }] }] },
    'arm',
    'oct',
    armDocuments,
    armEntrepriseDocuments,
    []
  )
  expect(errors).toMatchInlineSnapshot(`
    {
      "errors": [
        "le document \\"dep\\" est obligatoire",
        "le document \\"doe\\" est obligatoire",
      ],
      "valid": false,
    }
  `)
})

test.each<[number | undefined | null, EtapeTypeId, TitreTypeId, Parameters<typeof isEtapeComplete>[3], Parameters<typeof isEtapeComplete>[4], boolean]>([
  [undefined, 'mfr', 'arm', armDocuments, armEntrepriseDocuments, true],
  [null, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
  [0, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, true],
  [0, 'mfr', 'arm', armDocuments, armEntrepriseDocuments, true],
  [0, 'mfr', 'prm', armDocuments, armEntrepriseDocuments, false],
  [0, 'rde', 'arm', [], [], false],
  [3, 'mfr', 'arm', armDocuments, armEntrepriseDocuments, false],
  [3, 'mfr', 'axm', axmDocuments, axmEntrepriseDocuments, false],
])('teste la complétude de la durée %i pour une étapeType %s, un titreType %s', (duree, etapeType, titreType, documents, entreprisedocuments, error) => {
  const titreEtape = {
    ...etapeComplete,
    duree,
    typeId: etapeType,
  }

  const result = isEtapeComplete(titreEtape, titreType, 'oct', documents, entreprisedocuments, [])

  const errorLabel = 'la durée doit être renseignée'
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
