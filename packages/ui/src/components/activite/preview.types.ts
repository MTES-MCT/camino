import { FrequenceId } from 'camino-common/src/static/frequence'

import { Couleur } from 'camino-common/src/static/couleurs'
import { CaminoDate } from 'camino-common/src/date'

export interface Activite {
  suppression: boolean
  modification: boolean
  date: CaminoDate
  dateSaisie: CaminoDate

  id: string
  type: {
    id: string
    nom: string
    frequenceId: FrequenceId | undefined
    description: string
  }
  statut: {
    id: string
    nom: string
    couleur: Couleur
  }
  deposable: boolean
  annee: number
  periodeId: number
  documents: {}[]
  sections: { id: string }[]
  contenu: Record<string, unknown>
}
