export type PermissionId =
  | 'super'
  | 'admin'
  | 'editeur'
  | 'lecteur'
  | 'entreprise'
  | 'defaut'

export const permissionCheck = (
  permissionId: PermissionId | null | undefined,
  permissions: PermissionId[]
) => !!(permissionId && permissions.includes(permissionId))
