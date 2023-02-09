import { DEMARCHES_TYPES_IDS, DemarcheType, DemarchesTypes } from './demarchesTypes.js'
import { TITRES_TYPES_IDS, TitreTypeId } from './titresTypes.js'

const demarchesEverywhere = [
  DEMARCHES_TYPES_IDS.AutorisationDOuvertureDeTravaux,
  DEMARCHES_TYPES_IDS.DeclarationDArretDefinitifDesTravaux,
  DEMARCHES_TYPES_IDS.DeclarationDOuvertureDeTravaux,
  DEMARCHES_TYPES_IDS.Octroi,
  DEMARCHES_TYPES_IDS.Renonciation,
  DEMARCHES_TYPES_IDS.Retrait
]

const TITRES_TYPES_DEMARCHES_TYPES = {
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_CARRIERES]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_HYDROCARBURE]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_METAUX]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_CARRIERES]: [...demarchesEverywhere, DEMARCHES_TYPES_IDS.Prolongation],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE]: [...demarchesEverywhere, DEMARCHES_TYPES_IDS.ExtensionDePerimetre, DEMARCHES_TYPES_IDS.Mutation],
  [TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX]: [...demarchesEverywhere, DEMARCHES_TYPES_IDS.Prolongation],
  [TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.DeplacementDePerimetre,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.CONCESSION_FOSSILES]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.CONCESSION_HYDROCARBURE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.Conversion,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.CONCESSION_METAUX]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.Cession,
    DEMARCHES_TYPES_IDS.Decheance,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    DEMARCHES_TYPES_IDS.MutationPartielle
  ],
  [TITRES_TYPES_IDS.CONCESSION_RADIOACTIF]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.CONCESSION_SOUTERRAIN]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.CONCESSION_GRANULATS_MARINS]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.INDETERMINE_METAUX]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.INDETERMINE_RADIOACTIF]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES_CARRIERES]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_FOSSILES]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GEOTHERMIE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation,
    DEMARCHES_TYPES_IDS.MutationPartielle
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.ProlongationExceptionnelle
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_RADIOACTIF]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.Prorogation,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_SOUTERRAIN]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_GRANULATS_MARINS]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_FOSSILES]: [...demarchesEverywhere],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GEOTHERMIE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Fusion,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_HYDROCARBURE]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.Prorogation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_RADIOACTIF]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.Prorogation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
    DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation
  ],
  [TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_GRANULATS_MARINS]: [
    ...demarchesEverywhere,
    DEMARCHES_TYPES_IDS.Amodiation,
    DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
    DEMARCHES_TYPES_IDS.Mutation,
    DEMARCHES_TYPES_IDS.Prolongation1,
    DEMARCHES_TYPES_IDS.Prolongation2,
    DEMARCHES_TYPES_IDS.Prorogation,
    DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation
  ]
} as const

export const getDemarchesTypesByTitreType = (titreTypeId: TitreTypeId): DemarcheType[] => {
  return TITRES_TYPES_DEMARCHES_TYPES[titreTypeId].map(demarcheTypeId => DemarchesTypes[demarcheTypeId]).sort((a, b) => a.ordre - b.ordre)
}
