export interface QuantiteParMois {
  mois: string
  quantite: number
}

export interface StatistiquesUtilisateurs {
  rattachesAUneEntreprise: number
  rattachesAUneAdministration: number
  visiteursAuthentifies: number
  total: number
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
