import { EntrepriseId } from 'camino-common/src/entreprise.js'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles.js'
import { AdministrationId } from 'camino-common/src/static/administrations.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools.js'
import { CanReadDemarche } from './demarches.js'
import { canReadEtape } from './etapes.js'

export const canReadAvis = async (
  // FIXME vérifier la visibilité
  _avis: unknown,
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

  if (!(await canReadEtape(user, titreTypeId, titresAdministrationsLocales, entreprisesTitulairesOuAmodiataires, etapeTypeId, demarche))) {
    return false
  }

  if (isAdministration(user)) {
    return true
  }

  // if (document.public_lecture) {
  //   return true
  // }

  if (isEntrepriseOrBureauDEtude(user)) {
    // if (!document.entreprises_lecture) {
    //   return false
    // }

    const titulaires = await entreprisesTitulairesOuAmodiataires()

    return titulaires.some(entrepriseId => user.entreprises?.some(({ id }) => id === entrepriseId) ?? false)
  }

  return false
}
