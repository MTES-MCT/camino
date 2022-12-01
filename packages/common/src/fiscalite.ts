import { isAdministration, isEntreprise, isSuper, Role } from './roles.js'
import { AdministrationId } from './static/administrations.js'
import { DOMAINES_IDS } from './static/domaines.js'
import { CommonTitre } from './titres.js'

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

export const isFiscaliteGuyane = (fiscalite: Fiscalite): fiscalite is FiscaliteGuyane => {
  return 'guyane' in fiscalite
}

export const montantNetTaxeAurifere = (fiscalite: Fiscalite) => (isFiscaliteGuyane(fiscalite) ? fiscalite.guyane.taxeAurifere : 0)

export const fraisGestion = (fiscalite: Fiscalite): number => {
  return Number.parseFloat(((fiscalite.redevanceDepartementale + fiscalite.redevanceCommunale + montantNetTaxeAurifere(fiscalite)) * 0.08).toFixed(2))
}
export type UserFiscalite =
  | {
      entreprises?: { id: string }[] | null
      role: Role
      administrationId: AdministrationId | undefined | null
    }
  | undefined
  | null
export const fiscaliteVisible = (user: UserFiscalite, entrepriseId: string, titres: Partial<Pick<CommonTitre, 'domaineId'>>[]): boolean => {
  if (user) {
    if (
      titres.every(titre => {
        if (!titre.domaineId) {
          throw new Error("le domaineId d'un titre est obligatoire")
        }

        return [DOMAINES_IDS.GEOTHERMIE, DOMAINES_IDS.GRANULATS_MARINS, DOMAINES_IDS.SOUTERRAIN, DOMAINES_IDS.RADIOACTIF].includes(titre.domaineId)
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
