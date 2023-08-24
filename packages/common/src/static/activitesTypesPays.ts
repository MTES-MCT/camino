import { ACTIVITES_TYPES_IDS, ActivitesTypesId } from './activitesTypes.js'
import { PAYS_IDS, PaysId } from './pays.js'

export const activitesTypesPays: { [key in ActivitesTypesId]: PaysId[] } = {
  [ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"]]: [PAYS_IDS['Département de la Guyane']],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"]]: [],
  [ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration']]: [],
  [ACTIVITES_TYPES_IDS["rapport financier d'exploration"]]: [],
  [ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]]: [],
  [ACTIVITES_TYPES_IDS["rapport social et économique d'exploration"]]: [],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"]]: [],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"]]: [PAYS_IDS['Département de la Guyane']],
}
