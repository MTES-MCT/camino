import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { getAdministrationTitresTypesEtapesTypes } from 'camino-common/src/static/administrationsTitresTypesEtapesTypes.js'
import { EtapeTypeId, EtapesTypes } from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools.js'
import { CanReadDemarche, canReadDemarche } from './demarches.js'

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
