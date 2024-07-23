import { TITRES_TYPES_IDS, TitreTypeId } from './titresTypes'
import { ACTIVITES_TYPES_IDS, ActivitesTypesId } from './activitesTypes'

export const activitesTypesTitresTypes: { [key in ActivitesTypesId]: TitreTypeId[] } = {
  [ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"]]: [
    TITRES_TYPES_IDS.CONCESSION_METAUX,
    TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
    TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
  ],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"]]: [TITRES_TYPES_IDS.CONCESSION_METAUX, TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX],
  [ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration']]: [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX],
  [ACTIVITES_TYPES_IDS["rapport financier d'exploration"]]: [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX],
  [ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]]: [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX],
  [ACTIVITES_TYPES_IDS["rapport social et économique d'exploration"]]: [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"]]: [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS, TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"]]: [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX],
}
