import { ITitreDemarche } from '../../types'

import { DemarchesStatutsIds, isDemarcheStatutNonStatue, isDemarcheStatutNonValide } from 'camino-common/src/static/demarchesStatuts'
import { isDemarcheTypeOctroi, DemarchesTypes } from 'camino-common/src/static/demarchesTypes'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { CaminoDate } from 'camino-common/src/date'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'

export type TitreStatutIdFindDemarche = Pick<ITitreDemarche, 'typeId' | 'statutId' | 'demarcheDateDebut' | 'demarcheDateFin'>
export const titreStatutIdFind = (aujourdhui: CaminoDate, demarches: TitreStatutIdFindDemarche[] | null | undefined): TitreStatutId => {
  const titreDemarches = demarches ? demarches.filter(d => !DemarchesTypes[d.typeId]?.travaux) : null

  if (!titreDemarches || !titreDemarches.length) return TitresStatutIds.Indetermine

  // si toutes les démarches du titre ont le statut `Indetermine`
  // -> le titre a également le statut `Indetermine`
  if (titreDemarches.every(d => d.statutId === DemarchesStatutsIds.Indetermine)) return TitresStatutIds.Indetermine

  // s'il y a une seule démarche (octroi)
  if (titreDemarches.length === 1 && isDemarcheTypeOctroi(titreDemarches[0].typeId)) {
    // si le statut de la démarche est en instruction ou déposée
    // -> le statut du titre est demande initiale
    if (isDemarcheStatutNonStatue(titreDemarches[0].statutId)) {
      return TitresStatutIds.DemandeInitiale
    }

    // si le statut de la démarche est rejeté ou classé sans suite ou désisté
    // -> le statut du titre est demande classée
    if (isDemarcheStatutNonValide(titreDemarches[0].statutId)) {
      return TitresStatutIds.DemandeClassee
    }

    // si elle est statuée valide mais que sa phase n’est pas encore valide
    // -> le statut du titre est demande initiale
    if (isNullOrUndefined(titreDemarches[0].demarcheDateDebut) && isNullOrUndefined(titreDemarches[0].demarcheDateFin)) {
      return TitresStatutIds.DemandeInitiale
    }
  }

  const isValide: boolean =
    demarches?.some(({ demarcheDateDebut, demarcheDateFin }) => demarcheDateDebut && demarcheDateFin && aujourdhui >= demarcheDateDebut && aujourdhui <= demarcheDateFin) ?? false
  const inModificationEnInstance = titreInModificationEnInstance(titreDemarches)

  // Le titre est encore valide, mais il y a une demande de modification en cours
  if (isValide && inModificationEnInstance) {
    return TitresStatutIds.ModificationEnInstance
  }

  if (isValide) {
    return TitresStatutIds.Valide
  }

  // Le titre n’est plus valide, mais il y a une demande de modification en cours
  // qui permet au titre de rester valide, il est donc en survie provisoire
  if (inModificationEnInstance) {
    return TitresStatutIds.SurvieProvisoire
  }

  return TitresStatutIds.Echu
}

export const titreInModificationEnInstance = (demarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin'>[] | null | undefined): boolean => {
  return demarches?.some(({ demarcheDateDebut, demarcheDateFin }) => demarcheDateDebut && !demarcheDateFin) ?? false
}
