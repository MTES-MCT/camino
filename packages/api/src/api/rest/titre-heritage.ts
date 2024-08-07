import { DemarcheEtape } from 'camino-common/src/demarche'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { isFondamentalesStatutOk } from 'camino-common/src/static/etapesStatuts'
import { isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes'
import { TitrePropTitreEtapeFindDemarche } from 'camino-common/src/titres'

export const getMostRecentEtapeFondamentaleValide = <F extends Pick<DemarcheEtape, 'etape_statut_id' | 'etape_type_id' | 'ordre' | 'is_brouillon'>>(
  titreDemarches: TitrePropTitreEtapeFindDemarche<F>[]
): F | null => {
  const titreDemarchesDesc: TitrePropTitreEtapeFindDemarche<F>[] = titreDemarches.toSorted((a, b) => b.ordre - a.ordre)

  for (const titreDemarche of titreDemarchesDesc) {
    const titreEtapeDesc = titreDemarche.etapes.toSorted((a, b) => b.ordre - a.ordre)
    for (const titreEtape of titreEtapeDesc) {
      if (isEtapeTypeIdFondamentale(titreEtape.etape_type_id) && isFondamentalesStatutOk(titreEtape.etape_statut_id) && titreEtape.is_brouillon === ETAPE_IS_NOT_BROUILLON) {
        return titreEtape
      }
    }
  }

  return null
}
