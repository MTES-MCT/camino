import { DemarcheEtape } from 'camino-common/src/demarche.js'
import { isEtapeTypeIdFondamentale } from 'camino-common/src/static/etapesTypes.js'
import { TitrePropTitreEtapeFindDemarche } from 'camino-common/src/titres.js'

export const getMostRecentEtapeFondamentaleValide = <F extends Pick<DemarcheEtape, 'etape_statut_id' | 'etape_type_id' | 'ordre'>>(titreDemarches: TitrePropTitreEtapeFindDemarche<F>[]): F | null => {
  const titreDemarchesDesc: TitrePropTitreEtapeFindDemarche<F>[] = [...titreDemarches].sort((a, b) => b.ordre - a.ordre)

  for (const titreDemarche of titreDemarchesDesc) {
    const titreEtapeDesc = [...titreDemarche.etapes].sort((a, b) => b.ordre - a.ordre)
    for (const titreEtape of titreEtapeDesc) {
      if (isEtapeTypeIdFondamentale(titreEtape.etape_type_id) && ['acc', 'fai', 'fav', 'aco'].includes(titreEtape.etape_statut_id)) {
        return titreEtape
      }
    }
  }

  return null
}
