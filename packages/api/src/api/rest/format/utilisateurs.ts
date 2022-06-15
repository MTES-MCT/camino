import { IUtilisateur } from '../../../types'

export const utilisateursFormatTable = (utilisateurs: IUtilisateur[]) =>
  utilisateurs.map(utilisateur => {
    const lien = utilisateur.administrations?.length
      ? utilisateur.administrations.map(a => a.nom)
      : utilisateur.entreprises?.length
      ? utilisateur.entreprises.map(a => a.nom)
      : []

    return {
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      lien: lien.join(',')
    }
  })
