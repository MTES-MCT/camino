export interface CommonTitreONF {
  id: string
  slug: string
  nom: string
  statut: {
    nom: string
    couleur: string
  }
  references: {nom: string, type: { nom: string}}[]
  titulaires: {nom: string}[]
  dateCompletudePTMG: string
  dateReceptionONF: string
}
