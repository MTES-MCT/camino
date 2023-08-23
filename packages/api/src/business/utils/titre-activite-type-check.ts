import { IActiviteTypePays, ICommune } from '../../types.js'
import { Departements, toDepartementId } from 'camino-common/src/static/departement.js'
import { Regions } from 'camino-common/src/static/region.js'
import { activitesTypesTitresTypes } from 'camino-common/src/static/activitesTypes_titresTypes.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'

/**
 * Vérifie que le titre peut recevoir un type d'activité
 * @param activiteType - type d'activité
 * @param titre - titre
 */

export interface ActiviteTypeReduced {
  id: ActivitesTypesId
  activitesTypesPays?: Pick<IActiviteTypePays, 'paysId'>[] | undefined | null
}

export interface TitreReduced {
  typeId: string
  communes?: Pick<ICommune, 'id'>[] | undefined | null
}
export const titreActiviteTypeCheck = (activiteType: ActiviteTypeReduced, titre: TitreReduced) => {
  // si le type d'activité est relié au type de titre

  if (!activiteType.activitesTypesPays) {
    throw new Error('les activitesTypesPays ne sont pas chargés')
  }

  if (!titre.communes) {
    throw new Error('les communes du titre ne sont pas chargées')
  }

  if (activitesTypesTitresTypes[activiteType.id].some(titreTypeId => titreTypeId === titre.typeId)) {
    const titrePaysIds = titre.communes
      ?.map(({ id }) => toDepartementId(id))
      .map(departementId => Departements[departementId].regionId)
      .map(regionId => Regions[regionId].paysId)

    return (
      // et que le type d'activité n'est relié à aucun pays
      // ou que le type d'activite est relié à l'un des pays du titre
      !activiteType.activitesTypesPays.length || (!!titrePaysIds?.length && activiteType.activitesTypesPays.some(({ paysId }) => titrePaysIds.some(titrePaysId => paysId === titrePaysId)))
    )
  }

  return false
}
