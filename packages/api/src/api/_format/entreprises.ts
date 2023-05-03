import { IEntreprise } from '../../types.js'

import { titresFormat } from './titres.js'

/**
 * Formate une entreprise en fonction du profil de l'utilisateur
 *
 * @param user - Utilisateur
 * @param administration - Entreprise à formater
 * @returns Une entreprise formatée
 *
 */

export const entrepriseFormat = (entreprise: IEntreprise) => {
  entreprise.titulaireTitres = entreprise.titulaireTitres && titresFormat(entreprise.titulaireTitres)

  entreprise.amodiataireTitres = entreprise.amodiataireTitres && titresFormat(entreprise.amodiataireTitres)

  return entreprise
}
