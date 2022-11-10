import { TitresTypesIds, TitreTypeId } from '../static/titresTypes'
import { EtapeTypeId } from '../static/etapesTypes'
import { DemarcheTypeId } from '../static/demarchesTypes'
import { canEditAmodiataires, canEditDates, canEditDuree, canEditTitulaires, dureeOptionalCheck } from './titres-etapes'
import { User } from '../roles'
import { ADMINISTRATION_IDS } from '../static/administrations'

test.each<{ etapeTypeId: EtapeTypeId; demarcheTypeId: DemarcheTypeId; titreTypeId: TitreTypeId; optional: boolean }>([
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'arm', optional: false },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: false },
  { etapeTypeId: 'dex', demarcheTypeId: 'oct', titreTypeId: 'axm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'oct', titreTypeId: 'prm', optional: true },
  { etapeTypeId: 'mfr', demarcheTypeId: 'dep', titreTypeId: 'arm', optional: true }
])('dureeOptionalCheck $etapeTypeId | $demarcheTypeId | $titreTypeId | $optional', ({ etapeTypeId, demarcheTypeId, titreTypeId, optional }) => {
  expect(dureeOptionalCheck(etapeTypeId, demarcheTypeId, titreTypeId)).toEqual(optional)
})

test.each<TitreTypeId>(TitresTypesIds)('canEditDuree %p', titreTypeId => expect(canEditDuree(titreTypeId)).toMatchSnapshot())

test.each<{ titreTypeId: TitreTypeId; etapeTypeId: EtapeTypeId; user: User; canEdit: boolean }>([
  { titreTypeId: 'arm', etapeTypeId: 'mfr', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'arm', etapeTypeId: 'dpu', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'axm', etapeTypeId: 'mfr', user: { role: 'super', administrationId: undefined }, canEdit: false },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', user: { role: 'super', administrationId: undefined }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', user: { role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true },
  { titreTypeId: 'prm', etapeTypeId: 'mfr', user: { role: 'lecteur', administrationId: ADMINISTRATION_IDS.BRGM }, canEdit: true }
])('canEditDate $titreTypeId | $etapeTypeId | $user | $canEdit', ({ titreTypeId, etapeTypeId, user, canEdit }) => {
  expect(canEditDates(titreTypeId, etapeTypeId, user)).toEqual(canEdit)
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
