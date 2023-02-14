import { CaminoAnnee } from './date.js'
import { AdministrationTypeId } from './static/administrations.js'
import { RegionId } from './static/region.js'
import { SDOMZoneIds } from './static/sdom.js'
import { SUBSTANCES_FISCALES_IDS } from './static/substancesFiscales.js'
import { TitresTypes } from './static/titresTypes.js'

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

export type SubstancesFiscalesStats = (typeof substancesFiscalesStats)[number]
export const titreTypeIdDelais = [TitresTypes.axm.id, TitresTypes.prm.id, TitresTypes.cxm.id] as const
export type TitreTypeIdDelai = (typeof titreTypeIdDelais)[number]

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
  producteursOr: Record<CaminoAnnee, number>
  avisAXM: {
    [key in CaminoAnnee]?: { apd: { fav: number; def: number; dre: number; fre: number; ajo: number }; apo: { fav: number; def: number; dre: number; fre: number; ajo: number } }
  }
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

export interface StatistiquesGuyaneData {
  arm: EvolutionTitres
  prm: EvolutionTitres
  axm: EvolutionTitres
  cxm: EvolutionTitres
  titresArm: number
  titresPrm: number
  surfaceExploitation: number
  surfaceExploration: number
  titresAxm: number
  titresCxm: number
  annees: StatistiquesGuyaneActivite[]
}

export type StatistiquesGuyaneActivite = {
  annee: CaminoAnnee
  orNet: number
  carburantConventionnel: number
  carburantDetaxe: number
  mercure: number
  environnementCout: number
  effectifs: number
  activitesDeposesQuantite: number
  activitesDeposesRatio: number
}

export type StatistiquesGuyane = {
  data: StatistiquesGuyaneData
  parAnnee: Record<CaminoAnnee, StatistiquesGuyaneActivite>
}

export interface StatistiqueGranulatsMarinsStatAnnee {
  annee: number
  titresPrw: {
    quantite: number
    surface: number
  }
  titresPxw: {
    quantite: number
    surface: number
  }
  titresCxw: {
    quantite: number
    surface: number
  }
  volume: number
  masse: number
  activitesDeposesQuantite: number
  activitesDeposesRatio: number
  concessionsValides: {
    quantite: number
    surface: number
  }
}

export interface StatistiquesGranulatsMarins {
  annees: StatistiqueGranulatsMarinsStatAnnee[]
  surfaceExploration: number
  surfaceExploitation: number
  titresInstructionExploration: number
  titresValPrw: number
  titresInstructionExploitation: number
  titresValCxw: number
}
