import { ICommune } from '../../types.js'
import { Departements, toDepartementId } from 'camino-common/src/static/departement.js'
import { Regions } from 'camino-common/src/static/region.js'
import { activitesTypesTitresTypes } from 'camino-common/src/static/activitesTypesTitresTypes.js'
import { ActivitesTypesId } from 'camino-common/src/static/activitesTypes.js'
import { activitesTypesPays } from 'camino-common/src/static/activitesTypesPays.js'

export interface TitreReduced {
  typeId: string
  communes?: Pick<ICommune, 'id'>[] | undefined | null
}
/**
 * Vérifie que le titre peut recevoir un type d'activité
 * @param activiteTypeId - type d'activité
 * @param titre - titre
 */

export const titreActiviteTypeCheck = (activiteTypeId: ActivitesTypesId, titre: TitreReduced) => {
  // si le type d'activité est relié au type de titre

  if (!titre.communes) {
    throw new Error('les communes du titre ne sont pas chargées')
  }

  if (activitesTypesTitresTypes[activiteTypeId].some(titreTypeId => titreTypeId === titre.typeId)) {
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
