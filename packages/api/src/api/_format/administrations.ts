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

  const adminis = Administrations[administration.id]

  for (const key of Object.keys(adminis)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    administration[key] = adminis[key]
  }

  return administration
}
