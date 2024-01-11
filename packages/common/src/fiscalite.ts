import { isAdministration, isEntreprise, isSuper, User } from './roles.js'
import { DomaineId, DOMAINES_IDS } from './static/domaines.js'
import { CommonRestTitre } from './titres.js'
import { EntrepriseId } from './entreprise.js'
import { getDomaineId } from './static/titresTypes.js'
import { Decimal } from 'decimal.js'
import type { Fiscalite } from './validators/fiscalite.js'

export const montantNetTaxeAurifere = (fiscalite: Fiscalite) => ('guyane' in fiscalite ? fiscalite.guyane.taxeAurifere : 0)

export const fraisGestion = (fiscalite: Fiscalite): Decimal =>
  new Decimal(fiscalite.redevanceDepartementale).add(fiscalite.redevanceCommunale).add(montantNetTaxeAurifere(fiscalite)).mul(0.08).toDecimalPlaces(2)

export const fiscaliteVisible = (user: User, entrepriseId: EntrepriseId | undefined, titres: Partial<Pick<CommonRestTitre, 'type_id'>>[]): boolean => {
  return fiscaliteVisibleByDomaines(
    user,
    entrepriseId,
    titres.filter((titre): titre is Pick<CommonRestTitre, 'type_id'> => !!titre.type_id).map(({ type_id }) => getDomaineId(type_id))
  )
}
const fiscaliteVisibleByDomaines = (user: User, entrepriseId: EntrepriseId | undefined, domaineIds: DomaineId[]): boolean => {
  if (user && domaineIds.length > 0) {
    if (
      domaineIds.every(domaineId => {
        return [DOMAINES_IDS.GEOTHERMIE, DOMAINES_IDS.GRANULATS_MARINS, DOMAINES_IDS.SOUTERRAIN, DOMAINES_IDS.RADIOACTIF].includes(domaineId)
      })
    ) {
      return false
    }
    if (isSuper(user) || isAdministration(user)) {
      return true
    }
    if (isEntreprise(user) && user.entreprises?.find(({ id }) => entrepriseId === id)) {
      return true
    }
  }

  return false
}
