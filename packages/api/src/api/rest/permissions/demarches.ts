import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { isGestionnaire, isAssociee } from 'camino-common/src/static/administrationsTitresTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools'

export type CanReadDemarche = { public_lecture: boolean; entreprises_lecture: boolean }

// FIXME test
export const canReadDemarche = async (
  demarche: CanReadDemarche,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
): Promise<boolean> => {
  if (isSuper(user)) {
    return true
  }

  if (demarche.public_lecture) {
    return true
  }

  if (isAdministration(user)) {
    return (
      isGestionnaire(user.administrationId, await titreTypeId()) || isAssociee(user.administrationId, await titreTypeId()) || (await titresAdministrationsLocales()).includes(user.administrationId)
    )
  }

  if (isEntrepriseOrBureauDEtude(user)) {
    if (!demarche.entreprises_lecture) {
      return false
    }
    const entreprises = await entreprisesTitulairesOuAmodiataires()

    return user.entreprises.map(({ id }) => id).some(entrepriseId => entreprises.includes(entrepriseId))
  }

  return false
}
