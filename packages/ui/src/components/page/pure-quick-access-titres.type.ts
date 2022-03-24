export interface Titre {
  id: string
  nom: string
  domaine: {
    id: 'c' | 'f' | 'g' | 'h' | 'i' | 'm' | 'r' | 's' | 'w'
  }
  type: {
    type: {
      id: 'ap' | 'ar' | 'ax' | 'cx' | 'in' | 'pc' | 'pr' | 'px'
    }
  }
}
