import { IUtilisateur } from '../types'

const userSuper: Omit<IUtilisateur, 'permission'> = {
  id: 'super',
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  permissionId: 'super',
  dateCreation: '2022-05-12'
}

export { userSuper }
