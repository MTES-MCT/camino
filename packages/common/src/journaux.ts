export interface JournauxQueryParams {
  page: number
  recherche: string | null
  titreId: string | null
}

export interface Journal {
  id: string
  date: string
  differences: any
  elementId: string
  operation: 'update' | 'create' | 'delete'
  utilisateur: {
    nom: string
    prenom: string
  }
  titre: {
    nom: string
  }
}
export interface Journaux {
  elements: Journal[]
  page: number
  total: number
}
