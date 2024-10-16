import { isAdministrationAdmin, isAdministrationEditeur, isSuper, User } from '../roles'
import { TitreTypeId } from '../static/titresTypes'
import { isGestionnaire } from '../static/administrationsTitresTypes'
import { TitreStatutId } from '../static/titresStatuts'
import { canAdministrationModifyDemarches } from '../static/administrationsTitresTypesTitresStatuts'
import { ADMINISTRATION_TYPE_IDS, AdministrationId, Administrations } from '../static/administrations'
import { getEtapesTDE } from '../static/titresTypes_demarchesTypes_etapesTypes/index'
import { DemarcheTypeId } from '../static/demarchesTypes'
import { canCreateEtape } from './titres-etapes'
import { TitreGetDemarche } from '../titres'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from '../typescript-tools'
import { ETAPE_IS_BROUILLON } from '../etape'
import { DemarcheEtape, DemarcheId } from '../demarche'
import { machineIdFind } from '../machines'
import { ETAPES_TYPES, EtapesTypes } from '../static/etapesTypes'
import { EtapesTypesEtapesStatuts } from '../static/etapesTypesEtapesStatuts'

const hasOneDemarcheWithoutPhase = (demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]): boolean => {
  // Si il y a une seule démarche et qu'elle n'a pas encore créée de phase, alors on ne peut pas créer une deuxième démarche
  return isNotNullNorUndefinedNorEmpty(demarches) && demarches.length === 1 && isNullOrUndefined(demarches[0].demarche_date_debut)
}
export const canCreateDemarche = (
  user: DeepReadonly<User>,
  titreTypeId: TitreTypeId,
  titreStatutId: TitreStatutId,
  administrationsLocales: AdministrationId[],
  demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]
): boolean => {
  return !hasOneDemarcheWithoutPhase(demarches) && canEditDemarche(user, titreTypeId, titreStatutId, administrationsLocales)
}

export const canEditDemarche = (user: DeepReadonly<User>, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId, administrationsLocales: AdministrationId[]): boolean => {
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

export const canCreateTravaux = (user: DeepReadonly<User>, titreTypeId: TitreTypeId, administrations: AdministrationId[], demarches: Pick<TitreGetDemarche, 'demarche_date_debut'>[]): boolean => {
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

export const canPublishResultatMiseEnConcurrence = (
  user: DeepReadonly<User>,
  titre_type_id: TitreTypeId,
  demarche_type_id: DemarcheTypeId,
  etapes: Pick<DemarcheEtape, 'etape_type_id' | 'demarche_id_en_concurrence' | 'date' | 'etape_statut_id'>[],
  id: DemarcheId
): { valid: true; error: null } | { valid: false; error: string } => {
  if (!isSuper(user) && !isAdministrationAdmin(user) && !isAdministrationEditeur(user)) {
    return { valid: false, error: "L'utilisateur ne dispose pas des droits suffisants" }
  }
  const machineId = machineIdFind(
    titre_type_id,
    demarche_type_id,
    etapes.map(etape => ({ ...etape, typeId: etape.etape_type_id })),
    id
  )

  if (machineId !== 'ProcedureSpecifique') {
    return { valid: false, error: "Cette démarche n'est pas une procédure spécifique" }
  }

  if (
    !etapes.some(
      ({ etape_type_id, etape_statut_id }) =>
        etape_type_id === ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF && etape_statut_id === EtapesTypesEtapesStatuts.avisDeMiseEnConcurrenceAuJORF.TERMINE.etapeStatutId
    )
  ) {
    return { valid: false, error: "Cette démarche n'a pas terminé sa mise en concurrence" }
  }

  if (etapes.some(({ etape_type_id }) => etape_type_id === ETAPES_TYPES.resultatMiseEnConcurrence)) {
    return { valid: false, error: `Cette démarche a déja un ${EtapesTypes[ETAPES_TYPES.resultatMiseEnConcurrence].nom}` }
  }

  return { valid: true, error: null }
}
