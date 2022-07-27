import { isSuper, Role } from './roles'
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

export const isFiscaliteGuyane = (
  fiscalite: Fiscalite
): fiscalite is FiscaliteGuyane => {
  return 'guyane' in fiscalite
}

export const fiscaliteVisible = (
  user:
    | {
        entreprises?: { id: string }[] | null
        role: Role
        administrationId: AdministrationId | undefined | null
      }
    | undefined
    | null,
  _entrepriseId: string
): boolean => {
  if (user) {
    if (isSuper(user)) {
      return true
    }
  }

  return false
}
