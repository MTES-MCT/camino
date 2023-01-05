import { FrequenceId } from 'camino-common/src/static/frequence'

import { ActivitesStatutId } from 'camino-common/src/static/activitesStatuts'
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
  activiteStatutId: ActivitesStatutId
  deposable: boolean
  annee: number
  periodeId: number
  documents: {}[]
  sections: { id: string }[]
  contenu: Record<string, unknown>
}
