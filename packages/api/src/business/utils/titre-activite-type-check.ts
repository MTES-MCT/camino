import { IActiviteTypePays, ICommune, ITitreType } from '../../types'
import { Departements, isDepartementId } from 'camino-common/src/departement'
import { Regions } from 'camino-common/src/region'

/**
 * Vérifie que le titre peut recevoir un type d'activité
 * @param activiteType - type d'activité
 * @param titre - titre
 */

export interface ActiviteTypeReduced {
  titresTypes: Pick<ITitreType, 'id'>[]
  activitesTypesPays?: Pick<IActiviteTypePays, 'paysId'>[] | undefined | null
}

export interface TitreReduced {
  typeId: string
  communes?: Pick<ICommune, 'departementId'>[] | undefined | null
}
export const titreActiviteTypeCheck = (
  activiteType: ActiviteTypeReduced,
  titre: TitreReduced
) => {
  // si le type d'activité est relié au type de titre

  if (!activiteType.activitesTypesPays) {
    throw new Error('les activitesTypesPays ne sont pas chargés')
  }

  if (!titre.communes) {
    throw new Error('les communes du titre ne sont pas chargées')
  }

  if (
    activiteType.titresTypes.some(titreType => titreType.id === titre.typeId)
  ) {
    const titrePaysIds = titre.communes
      ?.map(({ departementId }) => departementId)
      .filter(isDepartementId)
      .map(departementId => Departements[departementId].regionId)
      .map(regionId => Regions[regionId].paysId)

    return (
      // et que le type d'activité n'est relié à aucun pays
      // ou que le type d'activite est relié à l'un des pays du titre
      !activiteType.activitesTypesPays.length ||
      (!!titrePaysIds?.length &&
        activiteType.activitesTypesPays.some(({ paysId }) =>
          titrePaysIds.some(titrePaysId => paysId === titrePaysId)
        ))
    )
  }

  return false
}
