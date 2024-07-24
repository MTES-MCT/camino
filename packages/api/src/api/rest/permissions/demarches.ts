import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools'
import { canReadTitre } from 'camino-common/src/permissions/titres'

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
