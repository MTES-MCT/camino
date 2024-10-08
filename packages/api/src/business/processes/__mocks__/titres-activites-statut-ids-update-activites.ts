import TitresActivites from '../../../database/models/titres-activites'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts'

const titresActivitesDelaiDepasse = [
  {
    date: '1000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    typeId: 'gra',
  },
] as TitresActivites[]

const titresActivitesDelaiNonDepasse = [
  {
    date: '3000-01-01',
    activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
    typeId: 'gra',
  },
] as TitresActivites[]

export { titresActivitesDelaiDepasse, titresActivitesDelaiNonDepasse }
