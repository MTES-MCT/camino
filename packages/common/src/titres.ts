export interface CommonTitre {
  id: string
  slug: string
  nom: string
  statut: {
    nom: string
    couleur: string
  }
  references: { nom: string; type: { nom: string } }[]
  titulaires: { nom: string }[]
}

export interface CommonTitrePTMG extends CommonTitre {
  enAttenteDePTMG: boolean
}

export interface CommonTitreONF extends CommonTitre {
  dateCompletudePTMG: string
  dateReceptionONF: string
  dateCARM: string
  enAttenteDeONF: boolean
}
