import { isAdministration, isEntreprise, isSuper, Role } from './roles'
import { AdministrationId } from './static/administrations'

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

export const fraisGestion = (fiscalite: Fiscalite) => (fiscalite.redevanceDepartementale + fiscalite.redevanceCommunale + montantNetTaxeAurifere(fiscalite)) * 0.08
export type UserFiscalite =
  | {
      entreprises?: { id: string }[] | null
      role: Role
      administrationId: AdministrationId | undefined | null
    }
  | undefined
  | null
export const fiscaliteVisible = (user: UserFiscalite, entrepriseId: string): boolean => {
  if (user) {
    if (isSuper(user) || isAdministration(user)) {
      return true
    }
    if (isEntreprise(user) && user.entreprises?.find(({ id }) => entrepriseId === id)) {
      return true
    }
  }

  return false
}
