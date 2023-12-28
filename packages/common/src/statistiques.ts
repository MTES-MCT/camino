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

export const substancesFiscalesStats = [
  SUBSTANCES_FISCALES_IDS.bauxite,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodiumContenu_,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitEnDissolutionParSondage,
  SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage,
] as const satisfies readonly SubstanceFiscaleId[]

const substancesFiscalesStatsValidator = z.enum(substancesFiscalesStats)
export type SubstancesFiscalesStats = z.infer<typeof substancesFiscalesStatsValidator>

export const titreTypeIdDelais = [TitresTypes.axm.id, TitresTypes.prm.id, TitresTypes.cxm.id] as const
const titreTypeIdDelaisValidator = z.enum(titreTypeIdDelais)
export type TitreTypeIdDelai = z.infer<typeof titreTypeIdDelaisValidator>

export const statistiquesDGTMValidator = z.object({
  depotEtInstructions: z.record(
    caminoAnneeValidator,
    z.object({
      totalAXMDeposees: z.number(),
      totalAXMOctroyees: z.number(),
      totalTitresDeposes: z.number(),
      totalTitresOctroyes: z.number(),
    })
  ),
  sdom: z.record(
    caminoAnneeValidator,
    z.object({
      [SDOMZoneIds.Zone0]: z.object({ depose: z.number(), octroye: z.number() }),
      [SDOMZoneIds.Zone0Potentielle]: z.object({ depose: z.number(), octroye: z.number() }),
      [SDOMZoneIds.Zone1]: z.object({ depose: z.number(), octroye: z.number() }),
      [SDOMZoneIds.Zone2]: z.object({ depose: z.number(), octroye: z.number() }),
      3: z.object({ depose: z.number(), octroye: z.number() }),
    })
  ),
  delais: z.record(
    caminoAnneeValidator,
    z.record(
      titreTypeIdDelaisValidator,
      z.object({ delaiInstructionEnJours: z.array(z.number()), delaiCommissionDepartementaleEnJours: z.array(z.number()), delaiDecisionPrefetEnJours: z.array(z.number()) })
    )
  ),
  producteursOr: z.record(caminoAnneeValidator, z.number()),
  avisAXM: z.record(
    caminoAnneeValidator,
    z.object({
      apd: z.object({ fav: z.number(), def: z.number(), dre: z.number(), fre: z.number(), ajo: z.number() }),
      apo: z.object({ fav: z.number(), def: z.number(), dre: z.number(), fre: z.number(), ajo: z.number() }),
    })
  ),
})
export type StatistiquesDGTM = z.infer<typeof statistiquesDGTMValidator>

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
    [SUBSTANCES_FISCALES_IDS.sel_ChlorureDeSodium_extraitParAbattage]: statistiquesMinerauxMetauxMetropoleSelsValidator,
  }),
  fiscaliteParSubstanceParAnnee: fiscaliteParSubstanceParAnneeValidator,
  prm: evolutionTitresValidator,
  cxm: evolutionTitresValidator,
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

export const statistiquesGuyaneDataValidator = z.object({
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
  annees: z.array(statistiquesGuyaneActiviteValidator),
})
export type StatistiquesGuyaneData = z.infer<typeof statistiquesGuyaneDataValidator>

export type StatistiquesGuyane = {
  data: StatistiquesGuyaneData
  parAnnee: Record<CaminoAnnee, StatistiquesGuyaneActivite>
}

const statistiqueGranulatsMarinsStatAnneeValidator = z.object({
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
  }),
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
