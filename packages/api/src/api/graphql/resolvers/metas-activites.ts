import { ActivitesStatut, activitesStatuts as activitesStatutsList } from 'camino-common/src/static/activitesStatuts'
import { ActiviteType, sortedActivitesTypes } from 'camino-common/src/static/activitesTypes'

export const activitesTypes = (): ActiviteType[] => sortedActivitesTypes

export const activitesStatuts = (): ActivitesStatut[] => activitesStatutsList
