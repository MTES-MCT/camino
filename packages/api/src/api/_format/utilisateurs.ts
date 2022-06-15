import { IUtilisateur } from '../../types'
import { administrationFormat } from './administrations'

export const utilisateurFormat = (utilisateur: IUtilisateur) => {
  // TODO: devrait formater les entreprises  de l'utilisateur

  if (utilisateur.administrations) {
    utilisateur.administrations =
      utilisateur.administrations.map(administrationFormat)
  }

  return utilisateur
}
