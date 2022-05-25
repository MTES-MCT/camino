import { permissionCheck, PermissionId } from './permissions'

export interface Fiscalite {
  redevanceCommunale: number
  redevanceDepartementale: number
  taxeAurifereGuyane: number
  totalInvestissementsDeduits: number
}

export const fiscaliteVisible = (
  user:
    | { entreprises?: { id: string }[] | null; permissionId: PermissionId }
    | undefined
    | null,
  entrepriseId: string
): boolean => {
  if (user) {
    if (
      permissionCheck(user.permissionId, [
        'super',
        'admin',
        'editeur',
        'lecteur'
      ]) ||
      user.entreprises?.map(({ id }) => id).includes(entrepriseId)
    ) {
      return true
    }
  }

  return false
}
