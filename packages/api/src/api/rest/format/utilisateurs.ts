import { IUtilisateur } from '../../../types'
import { isAdministration } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/administrations'

export const utilisateursFormatTable = (utilisateurs: IUtilisateur[]) =>
  utilisateurs.map(utilisateur => {
    const lien = isAdministration(utilisateur)
      ? [Administrations[utilisateur.administrationId].nom]
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
