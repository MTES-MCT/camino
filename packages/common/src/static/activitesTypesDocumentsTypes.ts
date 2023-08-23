import { ACTIVITES_TYPES_IDS, ActivitesTypesId } from './activitesTypes.js'
import { DOCUMENTS_TYPES_IDS, DocumentTypeId } from './documentsTypes.js'

export const activitesTypesDocumentsTypes = {
  [ACTIVITES_TYPES_IDS["rapport trimestriel d'exploitation d'or en Guyane"]]: [],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions M)"]]: [
    {
      documentTypeId: DOCUMENTS_TYPES_IDS.rapportAnnuelDExploitation,
      optionnel: false,
    },
  ],
  [ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration']]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.rapportDIntensiteDExploration, optionnel: true }],
  [ACTIVITES_TYPES_IDS["rapport financier d'exploration"]]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.rapportFinancierDExploration, optionnel: true }],
  [ACTIVITES_TYPES_IDS["rapport environnemental d'exploration"]]: [
    {
      documentTypeId: DOCUMENTS_TYPES_IDS.rapportEnvironnementalDExploration,
      optionnel: true,
    },
  ],
  [ACTIVITES_TYPES_IDS["rapport social et économique d'exploration"]]: [
    {
      documentTypeId: DOCUMENTS_TYPES_IDS.rapportSocialEtEconomiqueDExploration,
      optionnel: true,
    },
  ],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (permis et concessions W)"]]: [
    {
      documentTypeId: DOCUMENTS_TYPES_IDS.rapportAnnuelDExploitation,
      optionnel: false,
    },
  ],
  [ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"]]: [{ documentTypeId: DOCUMENTS_TYPES_IDS.rapportAnnuelDExploitation, optionnel: true }],
} as const satisfies { [key in ActivitesTypesId]: Readonly<{ documentTypeId: DocumentTypeId; optionnel: boolean }[]> }
