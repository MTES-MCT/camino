import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles.js'
import { TitreTypeId } from '../static/titresTypes.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'
import { TitreStatutId } from '../static/titresStatuts.js'
import { canAdministrationModifyDemarches } from '../static/administrationsTitresTypesTitresStatuts.js'
import { ADMINISTRATION_TYPE_IDS, AdministrationId, Administrations } from '../static/administrations.js'
import { getEtapesTDE } from '../static/titresTypes_demarchesTypes_etapesTypes/index.js'
import { DemarcheTypeId } from '../static/demarchesTypes.js'
import { canCreateEtape } from './titres-etapes.js'
import { TitreGetDemarche } from '../titres.js'
import { isNullOrUndefined } from '../typescript-tools.js'
import { ETAPE_IS_BROUILLON } from '../etape.js'

const hasOneDemarcheWithoutPhase = (demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]): boolean => {
  // Si il y a une seule démarche et qu’elle n’a pas encore créée de phase, alors on ne peut pas créer une deuxième démarche
  return demarches.length === 1 && isNullOrUndefined(demarches[0].demarche_date_debut)
}
export const canCreateDemarche = (
  user: User,
  titreTypeId: TitreTypeId,
  titreStatutId: TitreStatutId,
  administrationsLocales: AdministrationId[],
  demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]
): boolean => {
  return !hasOneDemarcheWithoutPhase(demarches) && canEditDemarche(user, titreTypeId, titreStatutId, administrationsLocales)
}

export const canEditDemarche = (user: User, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId, administrationsLocales: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (administrationsLocales.includes(user.administrationId) || isGestionnaire(user.administrationId, titreTypeId)) {
      if (canAdministrationModifyDemarches(user.administrationId, titreTypeId, titreStatutId)) {
        return true
      }
    }
  }

  return false
}

export const canDeleteDemarche = (user: User, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId, administrations: AdministrationId[], demarche: { etapes: unknown[] }): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (administrations.includes(user.administrationId) || isGestionnaire(user.administrationId, titreTypeId)) {
      if (canAdministrationModifyDemarches(user.administrationId, titreTypeId, titreStatutId)) {
        return demarche.etapes.length === 0
      }
    }
  }

  return false
}

export const canCreateTravaux = (user: User, titreTypeId: TitreTypeId, administrations: AdministrationId[], demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]): boolean => {
  if (hasOneDemarcheWithoutPhase(demarches)) {
    return false
  }

  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    if (administrations.includes(user.administrationId) || isGestionnaire(user.administrationId, titreTypeId)) {
      const isDreal = Administrations[user.administrationId].typeId === ADMINISTRATION_TYPE_IDS.DREAL
      if (isDreal) {
        return true
      }
    }
  }

  return false
}

export const canCreateEtapeByDemarche = (
  user: User,
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titresAdministrationsLocales: AdministrationId[],
  titreStatutId: TitreStatutId
): boolean => {
  const etapeTypeIds = getEtapesTDE(titreTypeId, demarcheTypeId)

  return etapeTypeIds.some(etapeTypeId => canCreateEtape(user, etapeTypeId, ETAPE_IS_BROUILLON, [], titresAdministrationsLocales, demarcheTypeId, { typeId: titreTypeId, titreStatutId }))
}
