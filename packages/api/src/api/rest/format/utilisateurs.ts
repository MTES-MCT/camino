import { Entreprise } from 'camino-common/src/entreprise'
import { isAdministration, isEntrepriseOrBureauDEtude, UserNotNull } from 'camino-common/src/roles'
import { Administrations } from 'camino-common/src/static/administrations'

export const utilisateursFormatTable = (utilisateurs: UserNotNull[], entreprises: Entreprise[]): (Pick<UserNotNull, 'nom' | 'prenom' | 'email' | 'role'> & { lien: string })[] =>
  utilisateurs.map(utilisateur => {
    let lien: string = ''

    if (isAdministration(utilisateur)) {
      lien = Administrations[utilisateur.administrationId].nom
    } else if (isEntrepriseOrBureauDEtude(utilisateur)) {
      lien = utilisateur.entrepriseIds.map(id => entreprises.find(e => e.id === id)?.nom ?? '').join(',')
    }

    return {
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      lien,
    }
  })
