import { TitreTypeId } from '../static/titresTypes.js'
import { EtapeTypeId } from '../static/etapesTypes.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { canCreateOrEditEtape, canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, dureeOptionalCheck } from './titres-etapes.js'
import { AdministrationId, ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { TestUser, testBlankUser } from '../tests-utils.js'
import { TitreStatutId } from '../static/titresStatuts.js'
import { EntrepriseId, newEntrepriseId } from '../entreprise.js'
import { EtapeStatutId } from '../static/etapesStatuts.js'

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
  { titreTypeId: 'arm', demarcheTypeId: 'dec', canEdit: false },
  { titreTypeId: 'axm', demarcheTypeId: 'dec', canEdit: true },
])('canEditDuree $titreTypeId | $demarcheTypeId | $canEdit', ({ titreTypeId, demarcheTypeId, canEdit }) => expect(canEditDuree(titreTypeId, demarcheTypeId)).toEqual(canEdit))

test.each<{ titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId; etapeTypeId: EtapeTypeId; user: TestUser; canEdit: boolean }>([
  { titreTypeId: 'arm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'arm', etapeTypeId: 'dpu', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'axm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super' }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dep', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
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
    expect(canCreateOrEditEtape({ ...user, ...testBlankUser }, etapeTypeId, etapeStatutId, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre, 'creation')).toEqual(canCreate)
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
  expect(canCreateOrEditEtape({ role: 'admin', administrationId, ...testBlankUser }, 'mcr', 'fai', [], [], 'oct', { typeId: titreTypeId, titreStatutId: 'val' }, 'modification')).toBe(canEdit)
})
