import { EntrepriseId } from 'camino-common/src/entreprise'
import { isSuper, isAdministration, isEntrepriseOrBureauDEtude, User } from 'camino-common/src/roles'
import { AdministrationId } from 'camino-common/src/static/administrations'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { SimplePromiseFn } from 'camino-common/src/typescript-tools'
import { CanReadDemarche } from './demarches'
import { canReadEtape } from './etapes'
import { EtapeDocument } from 'camino-common/src/etape'

export const canReadDocument = async (
  document: Pick<EtapeDocument, 'public_lecture' | 'entreprises_lecture'>,
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

  if (document.public_lecture) {
    return true
  }

  if (isEntrepriseOrBureauDEtude(user)) {
    if (!document.entreprises_lecture) {
      return false
    }

    const titulaires = await entreprisesTitulairesOuAmodiataires()

    return titulaires.some(entrepriseId => user.entreprises?.some(({ id }) => id === entrepriseId) ?? false)
  }

  return false
}
