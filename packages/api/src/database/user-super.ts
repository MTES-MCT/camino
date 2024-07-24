import { UserSuper } from 'camino-common/src/roles'
import { newUtilisateurId } from './models/_format/id-create'

export const userSuper: UserSuper = {
  id: newUtilisateurId('super'),
  email: 'camino@beta.gouv.fr',
  nom: 'Camino',
  prenom: '',
  role: 'super',
}
