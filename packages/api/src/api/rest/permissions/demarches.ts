import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { isGestionnaire, isAssociee } from 'camino-common/src/static/administrationsTitresTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId, DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools.js'

export type CanReadDemarche = { public_lecture: boolean; entreprises_lecture: boolean; titre_public_lecture: boolean; demarche_type_id: DemarcheTypeId }

export const canReadDemarche = async (
  demarche: CanReadDemarche,
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>
): Promise<boolean> => {
  if (DemarchesTypes[demarche.demarche_type_id].travaux) {
    return false
  }

  if (isSuper(user)) {
    return true
  }

  if (demarche.titre_public_lecture && demarche.public_lecture) {
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
