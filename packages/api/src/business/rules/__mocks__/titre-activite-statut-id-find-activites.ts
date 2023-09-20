import { ITitreActivite } from '../../../types.js'
import { ACTIVITES_STATUTS_IDS } from 'camino-common/src/static/activitesStatuts.js'

export const titreActiviteFermee = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.CLOTURE,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

export const titreActiviteDeposee = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.DEPOSE,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

export const titreActiviteAbsenteDelaiDepasse = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.ABSENT,
  date: '1000-01-01',
  typeId: 'gra',
} as ITitreActivite

export const titreActiviteEnCoursDelaiNonDepasse = {
  activiteStatutId: ACTIVITES_STATUTS_IDS.EN_CONSTRUCTION,
  date: '3000-01-01',
  typeId: 'gra',
} as ITitreActivite
