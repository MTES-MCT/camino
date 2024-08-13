import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools'
import { CanReadDemarche } from './demarches'
import { canReadEtape } from './etapes'
import { AvisVisibilityId, AvisVisibilityIds } from 'camino-common/src/static/avisTypes'

export const canReadAvis = async (
  avis: { avis_visibility_id: AvisVisibilityId },
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

  if (avis.avis_visibility_id === AvisVisibilityIds.Public) {
    return true
  }

  if (isEntrepriseOrBureauDEtude(user) && avis.avis_visibility_id === AvisVisibilityIds.TitulairesEtAdministrations) {
    const titulaires = await entreprisesTitulairesOuAmodiataires()

    return titulaires.some(entrepriseId => user.entrepriseIds?.includes(entrepriseId) ?? false)
  }

  return false
}
