import { IEntreprise } from '../../../types.js'

const entreprisesFormatTable = (entreprises: IEntreprise[]) =>
  entreprises.map(entreprise => {
    const entrepriseNew = {
      nom: entreprise.nom,
      siren: entreprise.legalSiren
    }

    return entrepriseNew
  })

export { entreprisesFormatTable }
