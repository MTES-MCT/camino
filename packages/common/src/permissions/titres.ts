import { isTitreType, TitresTypes, TitreTypeId } from '../static/titresTypes.js'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../static/demarchesTypes.js'
import { isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isSuper, User, UserNotNull } from '../roles.js'
import { AdministrationId } from '../static/administrations.js'
import { isGestionnaire } from '../static/administrationsTitresTypes.js'
import { CommuneId } from '../static/communes.js'
import { ActivitesTypesId, sortedActivitesTypes } from '../static/activitesTypes.js'
import { activitesTypesTitresTypes } from '../static/activitesTypesTitresTypes.js'
import { Departements, toDepartementId } from '../static/departement.js'
import { Regions } from '../static/region.js'
import { activitesTypesPays } from '../static/activitesTypesPays.js'
import { canAdministrationModifyTitres } from '../static/administrationsTitresTypesTitresStatuts.js'
import { TitreStatutId } from '../static/titresStatuts.js'

export const getLinkConfig = (typeId: TitreTypeId, demarches: { demarche_type_id: DemarcheTypeId }[]): { count: 'single' | 'multiple'; typeId: TitreTypeId } | null => {
  switch (typeId) {
    case 'axm':
      return { count: 'single', typeId: 'arm' }
    case 'pxm':
      return { count: 'single', typeId: 'prm' }
  }

  const titreType = TitresTypes[typeId]

  if (titreType.typeId === 'cx' && demarches.some(({ demarche_type_id }) => demarche_type_id === DEMARCHES_TYPES_IDS.Fusion)) {
    return { count: 'multiple', typeId }
  }

  return null
}

export const canLinkTitres = (user: User, administrationIds: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  }

  if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return administrationIds.includes(user.administrationId)
  }

  return false
}

export const TITRES_TYPES_IDS_DEMAT = ['arm', 'axm']

export function assertsCanCreateTitre(user: User, titreTypeId: TitreTypeId | undefined): asserts user is UserNotNull {
  if (!isTitreType(titreTypeId) || !canCreateTitre(user, titreTypeId)) {
    throw new Error('permissions insuffisantes')
  }
}

export const canCreateTitre = (user: User, titreTypeId: TitreTypeId | null): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return isGestionnaire(user.administrationId, titreTypeId)
  } else if (isEntreprise(user) || isBureauDEtudes(user)) {
    return TITRES_TYPES_IDS_DEMAT.includes(titreTypeId)
  }

  return false
}

export const canReadTitre = (user: User, titre: { public_lecture: boolean }): boolean => {
  if (isSuper(user)) {
    return true
  }

  return titre.public_lecture
}

export const canEditTitre = (user: User, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return isGestionnaire(user.administrationId, titreTypeId) && canAdministrationModifyTitres(user.administrationId, titreTypeId, titreStatutId)
  }

  return false
}

export const canDeleteTitre = (user: User): boolean => isSuper(user)

interface TitreReduced {
  titreTypeId: TitreTypeId
  // FIXME 2023-12-20 il faudrait ajouter les façades maritimes (impact sur le daily ?)
  communes: { id: CommuneId }[]
  demarches: unknown[]
}
/**
 * Vérifie que le titre peut avoir des activités
 * @param titre - titre
 */
export const canHaveActivites = (titre: TitreReduced): boolean => {
  if (titre.demarches.length === 0) {
    return false
  }

  return sortedActivitesTypes.some(activiteType => canHaveActiviteTypeId(activiteType.id, titre))
}

/**
 * Vérifie que le titre peut recevoir un type d'activité
 * @param activiteTypeId - type d'activité
 * @param titre - titre
 */
export const canHaveActiviteTypeId = (activiteTypeId: ActivitesTypesId, titre: TitreReduced): boolean => {
  if (titre.demarches.length === 0) {
    return false
  }

  if (activitesTypesTitresTypes[activiteTypeId].some(titreTypeId => titreTypeId === titre.titreTypeId)) {
    const titrePaysIds = titre.communes
      ?.map(({ id }) => toDepartementId(id))
      .map(departementId => Departements[departementId].regionId)
      .map(regionId => Regions[regionId].paysId)

    const pays = activitesTypesPays[activiteTypeId]

    return (
      // et que le type d'activité n'est relié à aucun pays
      // ou que le type d'activite est relié à l'un des pays du titre
      !pays.length || (!!titrePaysIds?.length && pays.some(paysId => titrePaysIds.some(titrePaysId => paysId === titrePaysId)))
    )
  }

  return false
}
