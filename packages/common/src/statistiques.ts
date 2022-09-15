import { CaminoAnnee } from './date'
import { AdministrationTypeId } from './static/administrations'

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
}
