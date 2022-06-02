import { permissionCheck, PermissionId } from './permissions'

export interface Fiscalite {
  redevanceCommunale: number
  redevanceDepartementale: number
  taxeAurifereGuyane: number
  totalInvestissementsDeduits: number
}

export const fiscaliteVisible = (
  user:
    | {
        entreprises?: { id: string }[] | null
        permissionId?: PermissionId
        permission?: { id: PermissionId }
      }
    | undefined
    | null,
  _entrepriseId: string
): boolean => {
  if (user) {
    if (
      permissionCheck(user.permissionId, ['super']) ||
      (user.permission && permissionCheck(user.permission.id, ['super']))
    ) {
      return true
    }
  }

  return false
}
