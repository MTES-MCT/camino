import { UserNotNull } from 'camino-common/src/roles.js'
import { newUtilisateurId } from './models/_format/id-create.js'

export const userSuper: UserNotNull = {
  id: newUtilisateurId('super'),
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  prenom: '',
  role: 'super',
}
