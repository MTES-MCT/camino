import { IUtilisateur } from '../types'

export const permissionAdministrationsCheck = (
  user: IUtilisateur | undefined,
  administrationsIds: string[]
) =>
  !!(
    user &&
    user.administrations &&
    user.administrations.length &&
    administrationsIds.length &&
    user.administrations.some(ua => administrationsIds.includes(ua.id))
  )
