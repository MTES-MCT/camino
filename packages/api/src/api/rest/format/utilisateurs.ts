import { formatUser, IUtilisateur } from '../../../types'
import { isAdministration } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'

export const utilisateursFormatTable = (utilisateurs: IUtilisateur[]) =>
  utilisateurs.map(utilisateur => {
    const user = formatUser(utilisateur)
    const lien = isAdministration(user) ? [Administrations[user.administrationId].nom] : utilisateur.entreprises?.map(a => a.nom) ?? []

    return {
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      lien: lien.join(','),
    }
  })
