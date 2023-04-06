import { IEntreprise } from '../../types.js'

import { titresFormat } from './titres.js'

/**
 * Formate une entreprise
 *
 * @param entreprise - entreprise
 * @returns Une entreprise formatée
 *
 */
export const entrepriseFormat = <T extends Pick<IEntreprise, 'titulaireTitres' | 'amodiataireTitres'>>(entreprise: T): T => {
  entreprise.titulaireTitres = entreprise.titulaireTitres && titresFormat(entreprise.titulaireTitres)

  entreprise.amodiataireTitres = entreprise.amodiataireTitres && titresFormat(entreprise.amodiataireTitres)

  return entreprise
}
