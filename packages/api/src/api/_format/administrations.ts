import { IAdministration } from '../../types'

import { titresFormat } from './titres'
import { utilisateurFormat } from './utilisateurs'
import {
  Administrations,
  ADMINISTRATION_TYPES
} from 'camino-common/src/administrations'
import { Regions } from 'camino-common/src/region'
import { Departements } from 'camino-common/src/departement'

/**
 * Formate une administration en fonction du profil de l'utilisateur
 *
 * @param administration - Administration à formater
 * @returns Une administration formatée
 *
 */

const administrationFormat = (administration: IAdministration) => {
  administration.gestionnaireTitres =
    administration.gestionnaireTitres &&
    titresFormat(administration.gestionnaireTitres)

  administration.localeTitres =
    administration.localeTitres && titresFormat(administration.localeTitres)

  administration.utilisateurs =
    administration.utilisateurs?.map(utilisateurFormat)

  const adminis = Administrations[administration.id]
  administration.type = ADMINISTRATION_TYPES[adminis.typeId]

  for (const key of Object.keys(adminis)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    administration[key] = adminis[key]
  }

  if (adminis.departementId) {
    administration.departement = Departements[adminis.departementId]
  }
  if (adminis.regionId) {
    administration.region = Regions[adminis.regionId]
  }

  return administration
}

export { administrationFormat }
