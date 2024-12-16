import { IEntreprise } from '../../../types'

export const entreprisesFormatTable = (entreprises: IEntreprise[]): { nom: string | undefined; siren: string | null | undefined }[] =>
  entreprises.map(entreprise => {
    const entrepriseNew = {
      nom: entreprise.nom,
      siren: entreprise.legalSiren,
    }

    return entrepriseNew
  })
