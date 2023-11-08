import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools'
import { CanReadDemarche, canReadDemarche } from './demarches'

// FIXME test
export const canReadEtape = async (
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  etapeTypeId: EtapeTypeId,
  demarche: CanReadDemarche
): Promise<boolean> => {
  if (isSuper(user)) {
    return true
  }

  if (!(await canReadDemarche(demarche, user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires))) {
    return false
  }

  const etapeType = EtapesTypes[etapeTypeId]

  if (etapeType.public_lecture) {
    return true
  }

  if (isAdministration(user)) {
    const titreTypeIdSync = await titreTypeId()
    const restrictions = getAdministrationTitresTypesEtapesTypes(user.administrationId).filter(r => r.lectureInterdit && r.titreTypeId === titreTypeIdSync && r.etapeTypeId === etapeTypeId)

    return restrictions.length === 0
  }

  if (isEntrepriseOrBureauDEtude(user)) {
    return etapeType.entreprises_lecture
  }

  return false
}
