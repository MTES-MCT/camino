import { IAdministration } from '../../types'

import { titresFormat } from './titres'
import { Administrations } from 'camino-common/src/static/administrations'

/**
 * Formate une administration en fonction du profil de l'utilisateur
 *
 * @param administration - Administration à formater
 * @returns Une administration formatée
 *
 */

export const administrationFormat = (administration: IAdministration) => {
  administration.gestionnaireTitres =
    administration.gestionnaireTitres &&
    titresFormat(administration.gestionnaireTitres)

  // FIXME On ne peut plus récupérer les titres locals via Objection, car j’ai viré la table.
  // Il faut donc soit modifier la relation dans Objection pour aller les chercher au bon endroit (mauvaise idée)
  // soit faire une route REST dédiée à ça qui permet d’aller les chercher, puis de modifier la page « administration » pour l’appeller
  administration.localeTitres =
    administration.localeTitres && titresFormat(administration.localeTitres)

  const adminis = Administrations[administration.id]

  for (const key of Object.keys(adminis)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    administration[key] = adminis[key]
  }

  return administration
}
