import {
  EtapeTypeId,
  ETAPES_TYPES
} from 'camino-common/src/static/etapesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'

type SubTitreTypeId = Extract<TitreTypeId, 'arm' | 'axm' | 'prm' | 'pxg'>
const demarcheEtapesTypesPublication: {
  [key in SubTitreTypeId]: readonly EtapeTypeId[]
} = {
  arm: [
    ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
    ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
    ETAPES_TYPES.avenantALautorisationDeRechercheMiniere
  ],
  axm: [
    ETAPES_TYPES.decisionDeLadministration,
    ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs
  ],
  prm: [ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs],
  pxg: [ETAPES_TYPES.decisionDeLadministration]
} as const

const isSubTitreTypeId = (
  titreTypeId: TitreTypeId
): titreTypeId is SubTitreTypeId => {
  return Object.keys(demarcheEtapesTypesPublication).includes(titreTypeId)
}

/**
 * Vérifie si l'étape est une étape de publication
 * @param etapeTypeId - id du type d'étape
 * @param titreTypeId - id du type de titre
 */
export const titreEtapePublicationCheck = (
  etapeTypeId: EtapeTypeId,
  titreTypeId: TitreTypeId
) =>
  !!(
    [
      ETAPES_TYPES.publicationDeDecisionAuJORF,
      ETAPES_TYPES.publicationDeDecisionAdministrativeAuJORF,
      ETAPES_TYPES.informationsHistoriquesIncompletes
    ].includes(etapeTypeId) ||
    (isSubTitreTypeId(titreTypeId) &&
      demarcheEtapesTypesPublication[titreTypeId]?.includes(etapeTypeId))
  )
