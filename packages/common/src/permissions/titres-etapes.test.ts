import { TitreTypeId } from '../static/titresTypes.js'
import { EtapeTypeId } from '../static/etapesTypes.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { canCreateEtape, canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, dureeOptionalCheck } from './titres-etapes.js'
import { User } from '../roles.js'
import { AdministrationId, ADMINISTRATION_IDS } from '../static/administrations.js'
import { test, expect } from 'vitest'
import { TitreStatutId } from '../static/titresStatuts.js'
import { newEntrepriseId } from '../entreprise.js'
import { EtapeStatutId } from '../static/etapesStatuts.js'

test.each<{ etapeTypeId: EtapeTypeId; demarcheTypeId: DemarcheTypeId; titreTypeId: TitreTypeId; optional: boolean }>([
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'arm', optional: false },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: false },
  { etapeTypeId: 'dex', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'prm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'dep', titreTypeId: 'arm', optional: true }
])('dureeOptionalCheck $etapeTypeId | $demarcheTypeId | $titreTypeId | $optional', ({ etapeTypeId, demarcheTypeId, titreTypeId, optional }) => {
  expect(dureeOptionalCheck(etapeTypeId, demarcheTypeId, titreTypeId)).toEqual(optional)
})

test.each<{ titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId; canEdit: boolean }>([
  { titreTypeId: 'arm', demarcheTypeId: 'dep', canEdit: false },
  { titreTypeId: 'arm', demarcheTypeId: 'dec', canEdit: false },
  { titreTypeId: 'axm', demarcheTypeId: 'dec', canEdit: true }
])('canEditDuree $titreTypeId | $demarcheTypeId | $canEdit', ({ titreTypeId, demarcheTypeId, canEdit }) => expect(canEditDuree(titreTypeId, demarcheTypeId)).toEqual(canEdit))

test.each<{ titreTypeId: TitreTypeId; demarcheTypeId: DemarcheTypeId; etapeTypeId: EtapeTypeId; user: User; canEdit: boolean }>([
  { titreTypeId: 'arm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'arm', etapeTypeId: 'dpu', demarcheTypeId: 'dec', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'axm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dec', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', demarcheTypeId: 'dep', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false }
])('canEditDate $titreTypeId | $demarcheTypeId | $etapeTypeId | $user | $canEdit', ({ titreTypeId, demarcheTypeId, etapeTypeId, user, canEdit }) => {
  expect(canEditDates(titreTypeId, demarcheTypeId, etapeTypeId, user)).toEqual(canEdit)
})

test.each<{ titreTypeId: TitreTypeId; user: User; canEdit: boolean }>([
  { titreTypeId: 'arm', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'axm', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'prm', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'prm', user: { role: 'defaut', administrationId: undefined }, canEdit: false }
])('canEditAmodiataires $titreTypeId | $user | $canEdit', ({ titreTypeId, user, canEdit }) => {
  expect(canEditAmodiataires(titreTypeId, user)).toEqual(canEdit)
})

test.each<{ titreTypeId: TitreTypeId; user: User; canEdit: boolean }>([
  { titreTypeId: 'prm', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', user: { role: 'defaut', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'axm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'axm', user: { role: 'defaut', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'arm', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'editeur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'arm', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: false },
  { titreTypeId: 'arm', user: { role: 'defaut', administrationId: undefined }, canEdit: false }
])('canEditTitulaires $titreTypeId | $user | $canEdit', ({ titreTypeId, user, canEdit }) => {
  expect(canEditTitulaires(titreTypeId, user)).toEqual(canEdit)
})

test.each<{
  user: User
  etapeTypeId: EtapeTypeId
  etapeStatutId: EtapeStatutId | null
  titreTitulaires: { id: string }[]
  titresAdministrationsLocales: AdministrationId[]
  demarcheTypeId: DemarcheTypeId
  titre: { typeId: TitreTypeId; statutId: TitreStatutId }
  canCreate: boolean
}>([
  {
    user: { role: 'super', administrationId: undefined },
    etapeTypeId: 'aac',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'amo',
    titre: { typeId: 'apc', statutId: 'dmc' },
    canCreate: true
  },
  {
    user: { role: 'defaut', administrationId: undefined },
    etapeTypeId: 'aac',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'amo',
    titre: { typeId: 'apc', statutId: 'dmc' },
    canCreate: false
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'aac',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'amo',
    titre: { typeId: 'apc', statutId: 'dmc' },
    canCreate: false
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'aac',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'amo',
    titre: { typeId: 'apc', statutId: 'dmc' },
    canCreate: false
  },
  {
    user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'aac',
    etapeStatutId: null,
    titreTitulaires: [{ id: newEntrepriseId('1') }],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'amo',
    titre: { typeId: 'apc', statutId: 'dmc' },
    canCreate: false
  },
  {
    user: { role: 'entreprise', administrationId: undefined, entreprises: [{ id: newEntrepriseId('1') }] },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [{ id: newEntrepriseId('1') }],
    titresAdministrationsLocales: [],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: true
  },
  {
    user: { role: 'admin', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: true
  },
  {
    user: { role: 'editeur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: true
  },
  {
    user: { role: 'lecteur', administrationId: 'ope-brgm-01' },
    etapeTypeId: 'mfr',
    etapeStatutId: 'aco',
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: true
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] },
    etapeTypeId: 'mfr',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: false
  },
  {
    user: { role: 'admin', administrationId: ADMINISTRATION_IDS['GENDARMERIE NATIONALE - GUYANE'] },
    etapeTypeId: 'aca',
    etapeStatutId: null,
    titreTitulaires: [],
    titresAdministrationsLocales: ['ope-brgm-01'],
    demarcheTypeId: 'oct',
    titre: { typeId: 'arm', statutId: 'dmc' },
    canCreate: false
  }
])(
  'canCreateEtape $user | $etapeTypeId | $etapeStatutId | $titreTitulaires | $titresAdministrationsLocales | $demarcheTypeId | $titre | $canCreate',
  ({ user, etapeTypeId, etapeStatutId, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre, canCreate }) => {
    expect(canCreateEtape(user, etapeTypeId, etapeStatutId, titreTitulaires, titresAdministrationsLocales, demarcheTypeId, titre)).toEqual(canCreate)
  }
)
