import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement.js'
import { TITRES_TYPES_TYPES_IDS } from 'camino-common/src/static/titresTypesTypes.js'
import { StatistiquesGuyaneData } from 'camino-common/src/statistiques.js'
import { statistiquesGuyane } from '../../graphql/resolvers/statistiques-guyane.js'
import { evolutionTitres } from './evolution-titres.js'

export const getGuyaneStatsInside =
  async (): Promise<StatistiquesGuyaneData> => {
    const guyane = [DEPARTEMENT_IDS.Guyane]
    const armData = await evolutionTitres(
      TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE,
      guyane
    )
    const prmData = await evolutionTitres(
      TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES,
      guyane
    )
    const axmData = await evolutionTitres(
      TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION,
      guyane
    )
    const cxmData = await evolutionTitres(
      TITRES_TYPES_TYPES_IDS.CONCESSION,
      guyane
    )

    const fromObjection = await statistiquesGuyane()

    return {
      arm: armData,
      prm: prmData,
      axm: axmData,
      cxm: cxmData,
      ...fromObjection
    }
  }
