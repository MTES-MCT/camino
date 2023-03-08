import { isAdministration } from 'camino-common/src/roles'

const visitUser = matomo => user => {
  if (user) {
    if (isAdministration(user)) {
      matomo.setCustomVariable(1, 'administrationId', user.administrationId, 'visit')
    }

    if (user.entreprises && user.entreprises.length) {
      user.entreprises.forEach(entreprise => {
        matomo.setCustomVariable(1, 'entreprisesIds', entreprise.id, 'visit')
      })
    }

    if (user.role) {
      matomo.setCustomVariable(5, 'role', user.role, 'visit')
    }
  }
}

const pageTitre = matomo => titre => {
  if (titre) {
    matomo.setCustomVariable(1, 'domaineId', titre.domaine.id, 'page')
    matomo.setCustomVariable(2, 'typeId', titre.type.typeId, 'page')
    matomo.setCustomVariable(3, 'statutId', titre.titreStatutId, 'page')
  }
}

export { visitUser, pageTitre }
