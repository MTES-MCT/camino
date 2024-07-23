import { TitresTypes, TitreTypeId } from '../static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from '../static/demarchesTypes'
import { isAdministration, isAdministrationAdmin, isAdministrationEditeur, isBureauDEtudes, isEntreprise, isEntrepriseOrBureauDEtude, isSuper, User } from '../roles'
import { AdministrationId } from '../static/administrations'
import { isAssociee, isGestionnaire } from '../static/administrationsTitresTypes'
import { CommuneId } from '../static/communes'
import { ActivitesTypesId, sortedActivitesTypes } from '../static/activitesTypes'
import { activitesTypesTitresTypes } from '../static/activitesTypesTitresTypes'
import { activitesTypesPays } from '../static/activitesTypesPays'
import { canAdministrationModifyTitres } from '../static/administrationsTitresTypesTitresStatuts'
import { TitreStatutId } from '../static/titresStatuts'
import { territoiresIdFind } from '../territoires'
import { DeepReadonly, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty, SimplePromiseFn } from '../typescript-tools'
import { SecteursMaritimes } from '../static/facades'
import { EntrepriseId } from '../entreprise'

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

export const canReadTitre = async (
  user: User,
  titreTypeId: SimplePromiseFn<TitreTypeId>,
  titresAdministrationsLocales: SimplePromiseFn<AdministrationId[]>,
  entreprisesTitulairesOuAmodiataires: SimplePromiseFn<EntrepriseId[]>,
  titre: { public_lecture: boolean }
): Promise<boolean> => {
  if (isSuper(user)) {
    return true
  }

  if (titre.public_lecture) {
    return true
  }

  if (isAdministration(user)) {
    return (
      isGestionnaire(user.administrationId, await titreTypeId()) || isAssociee(user.administrationId, await titreTypeId()) || (await titresAdministrationsLocales()).includes(user.administrationId)
    )
  }

  if (isEntrepriseOrBureauDEtude(user)) {
    const entreprises = await entreprisesTitulairesOuAmodiataires()

    return user.entreprises.map(({ id }) => id).some(entrepriseId => entreprises.includes(entrepriseId))
  }

  return false
}

export const canEditTitre = (user: User, titreTypeId: TitreTypeId, titreStatutId: TitreStatutId, administrationsLocales: AdministrationId[]): boolean => {
  if (isSuper(user)) {
    return true
  } else if (isAdministrationAdmin(user) || isAdministrationEditeur(user)) {
    return (
      (isGestionnaire(user.administrationId, titreTypeId) || administrationsLocales.includes(user.administrationId)) && canAdministrationModifyTitres(user.administrationId, titreTypeId, titreStatutId)
    )
  }

  return false
}

export const canDeleteTitre = (user: User): boolean => isSuper(user)

interface TitreReduced {
  titreTypeId: TitreTypeId
  communes: DeepReadonly<{ id: CommuneId }[]>
  secteursMaritime: SecteursMaritimes[]
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
    const territoires = territoiresIdFind(titre.communes, titre.secteursMaritime)
    const pays = activitesTypesPays[activiteTypeId]

    return (
      // et que le type d'activité n'est relié à aucun pays
      // ou que le type d'activite est relié à l'un des pays du titre
      isNullOrUndefinedOrEmpty(pays) || (isNotNullNorUndefinedNorEmpty(territoires.pays) && pays.some(paysId => territoires.pays.some(titrePaysId => paysId === titrePaysId)))
    )
  }

  return false
}

export const canHaveForages = (titreTypeId: TitreTypeId): boolean => titreTypeId === 'pxg'
