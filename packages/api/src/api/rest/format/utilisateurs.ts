import { formatUser, IUtilisateur } from '../../../types.js'
import { isAdministration } from 'camino-common/src/roles.js'
import { Administrations } from 'camino-common/src/static/administrations.js'

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
