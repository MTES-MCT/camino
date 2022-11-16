import { DEPARTEMENT_IDS } from "camino-common/src/static/departement"
import { TITRES_TYPES_TYPES_IDS } from "camino-common/src/static/titresTypesTypes"
import { StatistiquesGuyane } from "camino-common/src/statistiques"
import { evolutionTitres } from "./evolution-titres"

export const getGuyaneStatsInside =
  async (): Promise<StatistiquesGuyane> => {
    const guyane = [DEPARTEMENT_IDS.Guyane]
    const armData = await evolutionTitres(TITRES_TYPES_TYPES_IDS.AUTORISATION_DE_RECHERCHE,guyane)
    const prmData = await evolutionTitres(TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES, guyane)
    const axmData = await evolutionTitres(TITRES_TYPES_TYPES_IDS.AUTORISATION_D_EXPLOITATION, guyane)
    const cxmData = await evolutionTitres(TITRES_TYPES_TYPES_IDS.CONCESSION, guyane)

    return {
        arm: armData,
      prm: prmData,
      axm: axmData,
      cxm: cxmData
    }
  }