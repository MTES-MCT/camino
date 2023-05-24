import { z } from 'zod'
import { CaminoAnnee, caminoAnneeValidator } from './date.js'
import { AdministrationTypeId } from './static/administrations.js'
import { regionIdValidator } from './static/region.js'
import { SDOMZoneIds } from './static/sdom.js'
import { SUBSTANCES_FISCALES_IDS, SubstanceFiscaleId } from './static/substancesFiscales.js'
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
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage,
] as const satisfies readonly SubstanceFiscaleId[]

const substancesFiscalesStatsValidator = z.enum(substancesFiscalesStats)
export type SubstancesFiscalesStats = z.infer<typeof substancesFiscalesStatsValidator>

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
const statistiquesMinerauxMetauxMetropoleSelsValidator = z.record(caminoAnneeValidator, z.record(regionIdValidator, z.number()))
export type StatistiquesMinerauxMetauxMetropoleSels = z.infer<typeof statistiquesMinerauxMetauxMetropoleSelsValidator>

const fiscaliteParSubstanceParAnneeValidator = z.record(substancesFiscalesStatsValidator, z.record(caminoAnneeValidator, z.number()))
export type FiscaliteParSubstanceParAnnee = z.infer<typeof fiscaliteParSubstanceParAnneeValidator>

const evolutionTitresValidator = z.object({
  depot: z.record(caminoAnneeValidator, z.number()),
  octroiEtProlongation: z.record(caminoAnneeValidator, z.number()),
  refusees: z.record(caminoAnneeValidator, z.number()),
  surface: z.record(caminoAnneeValidator, z.number()),

})

export type EvolutionTitres = z.infer<typeof evolutionTitresValidator>

export const statistiquesMinerauxMetauxMetropoleValidator = z.object({
  surfaceExploration: z.number(),
  surfaceExploitation: z.number(),
  titres: z.object({
    instructionExploration: z.number(),
    valPrm: z.number(),
    instructionExploitation: z.number(),
    valCxm: z.number(),
  }),
  substances: z.object({
    [SUBSTANCES_FISCALES_IDS.bauxite]: z.record(caminoAnneeValidator, z.number()),
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_]: statistiquesMinerauxMetauxMetropoleSelsValidator,
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage]: statistiquesMinerauxMetauxMetropoleSelsValidator,
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]: statistiquesMinerauxMetauxMetropoleSelsValidator
}),
  fiscaliteParSubstanceParAnnee: fiscaliteParSubstanceParAnneeValidator,
  prm: evolutionTitresValidator,
  cxm: evolutionTitresValidator
})
export type StatistiquesMinerauxMetauxMetropole = z.infer<typeof statistiquesMinerauxMetauxMetropoleValidator>


const statistiquesGuyaneActiviteValidator = z.object({
  annee: caminoAnneeValidator,
  orNet: z.number(),
  carburantConventionnel: z.number(),
  carburantDetaxe: z.number(),
  mercure: z.number(),
  environnementCout: z.number(),
  effectifs: z.number(),
  activitesDeposesQuantite: z.number(),
  activitesDeposesRatio: z.number(),
})
export type StatistiquesGuyaneActivite = z.infer<typeof statistiquesGuyaneActiviteValidator>

export const statistiquesGuyaneDataValidator = z.object( {
  arm: evolutionTitresValidator,
  cxm: evolutionTitresValidator,
  prm: evolutionTitresValidator,
  axm: evolutionTitresValidator,
  titresArm: z.number(),
  titresPrm: z.number(),
  surfaceExploitation: z.number(),
  surfaceExploration: z.number(),
  titresAxm: z.number(),
  titresCxm: z.number(),
  annees: z.array(statistiquesGuyaneActiviteValidator)
})
export type StatistiquesGuyaneData = z.infer<typeof statistiquesGuyaneDataValidator>


export type StatistiquesGuyane = {
  data: StatistiquesGuyaneData
  parAnnee: Record<CaminoAnnee, StatistiquesGuyaneActivite>
}


export const statistiqueGranulatsMarinsStatAnneeValidator = z.object({
  annee: z.number(),
  titresPrw: z.object({
    quantite: z.number(),
    surface: z.number(),
  }),
  titresPxw: z.object({
    quantite: z.number(),
    surface: z.number(),
  }),
  titresCxw: z.object({
    quantite: z.number(),
    surface: z.number(),
  }),
  volume: z.number(),
  masse: z.number(),
  activitesDeposesQuantite: z.number(),
  activitesDeposesRatio: z.number(),
  concessionsValides: z.object({
    quantite: z.number(),
    surface: z.number(),
  })
})
export type StatistiqueGranulatsMarinsStatAnnee = z.infer<typeof statistiqueGranulatsMarinsStatAnneeValidator>

export const statistiquesGranulatsMarinsValidator = z.object({
  annees: z.array(statistiqueGranulatsMarinsStatAnneeValidator),
  surfaceExploration: z.number(),
  surfaceExploitation: z.number(),
  titresInstructionExploration: z.number(),
  titresValPrw: z.number(),
  titresInstructionExploitation: z.number(),
  titresValCxw: z.number(),
})
export type StatistiquesGranulatsMarins = z.infer<typeof statistiquesGranulatsMarinsValidator>

export const anneeCountStatistiqueValidator = z.object({
  annee: caminoAnneeValidator,
  count: z.coerce.number(),
})
export type AnneeCountStatistique = z.infer<typeof anneeCountStatistiqueValidator>
