import TitresActivites from '../../../database/models/titres-activites.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'

const titresActivitesDelaiDepasse = [
  {
    date: '1000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    type: { delaiMois: 3 }
  }
] as TitresActivites[]

const titresActivitesDelaiNonDepasse = [
  {
    date: '3000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    type: { delaiMois: 3 }
  }
] as TitresActivites[]

export { titresActivitesDelaiDepasse, titresActivitesDelaiNonDepasse }
