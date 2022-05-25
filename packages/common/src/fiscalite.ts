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
) => {
  return (
    user &&
    (permissionCheck(user.permissionId, [
      'super',
      'admin',
      'editeur',
      'lecteur'
    ]) ||
      user.entreprises?.map(({ id }) => id).includes(entrepriseId))
  )
}
