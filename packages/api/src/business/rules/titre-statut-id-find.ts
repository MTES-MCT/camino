import { ITitreDemarche } from '../../types.js'

import { DemarchesStatutsIds, isDemarcheStatutNonStatue, isDemarcheStatutNonValide } from 'camino-common/src/static/demarchesStatuts.js'
import { isDemarcheTypeOctroi, DemarchesTypes } from 'camino-common/src/static/demarchesTypes.js'
import { TitresStatutIds, TitreStatutId } from 'camino-common/src/static/titresStatuts.js'
import { CaminoDate } from 'camino-common/src/date.js'

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
  }

  if (
    demarches?.some(({ demarcheDateDebut, demarcheDateFin }) => demarcheDateDebut && demarcheDateFin && aujourdhui >= demarcheDateDebut && aujourdhui <= demarcheDateFin)
  ) {
    return TitresStatutIds.Valide
  }

  if (titreInSurvieProvisoire(titreDemarches)) {
    return TitresStatutIds.ModificationEnInstance
  }

  return TitresStatutIds.Echu
}

export const titreInSurvieProvisoire = (demarches: Pick<ITitreDemarche, 'demarcheDateDebut' | 'demarcheDateFin'>[] | null | undefined): boolean => {
  return (
    demarches?.some(({ demarcheDateDebut, demarcheDateFin }) => demarcheDateDebut && !demarcheDateFin) ?? false
  )
}
