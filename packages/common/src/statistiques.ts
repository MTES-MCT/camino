import { CaminoAnnee } from './date'
import { AdministrationTypeId } from './static/administrations'
import { RegionId } from './static/region'
import { SDOMZoneIds } from './static/sdom'
import { SUBSTANCES_FISCALES_IDS } from './static/substancesFiscales'
import { TitresTypes } from './static/titresTypes'

export interface QuantiteParMois {
  mois: string
  quantite: number
}

type StatistiquesAdministrationsType = Record<AdministrationTypeId, number>

export interface StatistiquesUtilisateurs {
  rattachesAUneEntreprise: number
  rattachesAUnTypeDAdministration: StatistiquesAdministrationsType
  visiteursAuthentifies: number
}

export interface Statistiques {
  titresActivitesBeneficesEntreprise: number
  titresActivitesBeneficesAdministration: number
  recherches: QuantiteParMois[]
  titresModifies: QuantiteParMois[]
  actions: number
  sessionDuree: number
  telechargements: number
  demarches: number
  signalements: number
  reutilisations: number
  utilisateurs: StatistiquesUtilisateurs
}

export interface DepotEtInstructionStat {
  totalAXMDeposees: number
  totalAXMOctroyees: number
  totalTitresDeposes: number
  totalTitresOctroyes: number
}

export const substancesFiscalesStats = [
  SUBSTANCES_FISCALES_IDS.bauxite,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage
] as const

export type SubstancesFiscalesStats = typeof substancesFiscalesStats[number]
export const titreTypeIdDelais = [TitresTypes.axm.id, TitresTypes.prm.id, TitresTypes.cxm.id] as const
export type TitreTypeIdDelai = typeof titreTypeIdDelais[number]

export interface StatistiquesDGTM {
  depotEtInstructions: Record<CaminoAnnee, DepotEtInstructionStat>
  sdom: Record<
    CaminoAnnee,
    {
      [SDOMZoneIds.Zone0]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone0Potentielle]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone1]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone2]: { depose: number; octroye: number }
      3: { depose: number; octroye: number }
    }
  >
  delais: Record<
    CaminoAnnee,
    Record<
      TitreTypeIdDelai,
      {
        delaiInstructionEnJours: number[]
        delaiCommissionDepartementaleEnJours: number[]
        delaiDecisionPrefetEnJours: number[]
      }
    >
  >
}

export type StatistiquesMinerauxMetauxMetropoleSels = { [key in CaminoAnnee]: { [key in RegionId]?: number } }

export type FiscaliteParSubstanceParAnnee = Record<SubstancesFiscalesStats, Record<CaminoAnnee, number>>

export type EvolutionTitres = {
  depot: Record<CaminoAnnee, number>
  octroiEtProlongation: Record<CaminoAnnee, number>
  refusees: Record<CaminoAnnee, number>
  surface: Record<CaminoAnnee, number>
}
export interface StatistiquesMinerauxMetauxMetropole {
  surfaceExploration: number
  surfaceExploitation: number
  titres: {
    instructionExploration: number
    valPrm: number
    instructionExploitation: number
    valCxm: number
  }
  substances: {
    [SUBSTANCES_FISCALES_IDS.bauxite]: Record<CaminoAnnee, number>
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_]: StatistiquesMinerauxMetauxMetropoleSels
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage]: StatistiquesMinerauxMetauxMetropoleSels
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]: StatistiquesMinerauxMetauxMetropoleSels
  }
  fiscaliteParSubstanceParAnnee: FiscaliteParSubstanceParAnnee
  prm: EvolutionTitres
  cxm: EvolutionTitres
}
