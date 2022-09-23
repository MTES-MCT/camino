import { CaminoAnnee } from './date'
import { AdministrationTypeId } from './static/administrations'
import { SDOMZoneIds } from './static/sdom'

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

export interface StatistiquesDGTM {
  depotEtInstructions: Record<CaminoAnnee, DepotEtInstructionStat>
  sdom: Record<
    CaminoAnnee,
    {
      [SDOMZoneIds.Zone0]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone0Potentielle]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone1]: { depose: number; octroye: number }
      [SDOMZoneIds.Zone2]: { depose: number; octroye: number }
    }
  >
  delais: Record<CaminoAnnee, { delaiInstructionEnJours: number[]; delaiCommissionDepartementaleEnJours: number[] }>
}

export interface StatistiquesMetauxMinerauxMetropole {
  surfaceExploration: number
  surfaceExploitation: number
  titres: {
    arm: number
    prm: number
    axm: number
    pxm: number
    cxm: number
  }
}
