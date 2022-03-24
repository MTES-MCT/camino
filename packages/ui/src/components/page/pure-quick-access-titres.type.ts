import {DomaineId} from "@/../../common/types";

export interface Titre {
  id: string
  nom: string
  domaine: {
    id : DomaineId
  }
  type: {
    type: {
      id: 'ap' | 'ar' | 'ax' | 'cx' | 'in' | 'pc' | 'pr' | 'px'
    }
  }
}
