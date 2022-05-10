export interface QuantiteParMois {
  mois: string
  quantite: string
}

export interface Statistiques {
  titresActivitesBeneficesEntreprise: number
  titresActivitesBeneficesAdministration: number
  recherches: QuantiteParMois[]
  titresModifies: QuantiteParMois[]
  actions: string
  sessionDuree: string
  telechargements: string
  demarches: string
  signalements: string
  reutilisations: string
}
