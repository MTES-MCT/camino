import { IEntreprise } from '../../../types'

export const entreprisesFormatTable = (entreprises: IEntreprise[]) =>
  entreprises.map(entreprise => {
    const entrepriseNew = {
      nom: entreprise.nom,
      siren: entreprise.legalSiren,
    }

    return entrepriseNew
  })
