import { isAdministration, isEntreprise, isSuper, User } from './roles.js'
import { DomaineId, DOMAINES_IDS } from './static/domaines.js'
import { CommonTitre } from './titres.js'
import { EntrepriseId } from './entreprise.js'
import { getDomaineId } from './static/titresTypes.js'

export type Fiscalite = FiscaliteGuyane | FiscaliteFrance
export interface FiscaliteFrance {
  redevanceCommunale: number
  redevanceDepartementale: number
}

export interface FiscaliteGuyane extends FiscaliteFrance {
  guyane: {
    taxeAurifereBrute: number
    totalInvestissementsDeduits: number
    taxeAurifere: number
  }
}

export const isFiscaliteGuyane = (fiscalite: Fiscalite): fiscalite is FiscaliteGuyane => 'guyane' in fiscalite

export const montantNetTaxeAurifere = (fiscalite: Fiscalite) => (isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.taxeAurifere : 0)

export const fraisGestion = (fiscalite: Fiscalite): number =>
  Number.parseFloat(((fiscalite.redevanceDepartementale + fiscalite.redevanceCommunale + montantNetTaxeAurifere(fiscalite)) * 0.08).toFixed(2))

export const fiscaliteVisible = (user: User, entrepriseId: EntrepriseId, titres: Partial<Pick<CommonTitre, 'typeId'>>[]): boolean => {
  return fiscaliteVisibleByDomaines(
    user,
    entrepriseId,
    titres.filter((titre): titre is Pick<CommonTitre, 'typeId'> => !!titre.typeId).map(({ typeId }) => getDomaineId(typeId))
  )
}
export const fiscaliteVisibleByDomaines = (user: User, entrepriseId: EntrepriseId, domaineIds: DomaineId[]): boolean => {
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
