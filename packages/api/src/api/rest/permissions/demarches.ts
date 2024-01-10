import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools.js'
import { canReadTitre } from 'camino-common/src/permissions/titres.js'

export type CanReadDemarche = { public_lecture: boolean; entreprises_lecture: boolean; titre_public_lecture: boolean; demarche_type_id: DemarcheTypeId }

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

  if (!(await canReadTitre(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, { public_lecture: demarche.titre_public_lecture }))) {
    return false
  }

  if (demarche.public_lecture) {
    return true
  }

  if (isAdministration(user)) {
    return true
  }

  if (isEntrepriseOrBureauDEtude(user)) {
    return demarche.entreprises_lecture
  }

  return false
}
