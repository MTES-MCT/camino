import { QueryBuilder } from 'objection'

import { IUtilisateur } from '../../../types'

import ActivitesTypes from '../../models/activites-types'
import { emailsLectureQuery } from './administrations'

const administrationsActivitesTypesEmailsQueryModify = (
  q: QueryBuilder<ActivitesTypes, ActivitesTypes | ActivitesTypes[]>,
  user: IUtilisateur | null | undefined
) => {
  q.select('activitesTypes.*')
  q.joinRelated('administrationsEmails')
  q.select('administrations__activites_types__emails.email')

  q.whereRaw(`?? = ?`, [
    emailsLectureQuery(user, 'administrations_emails'),
    true
  ])

  q.groupBy(
    'activitesTypes.id',
    'administrations__activites_types__emails.administration_id',
    'administrations__activites_types__emails.email'
  )

  return q
}

export { administrationsActivitesTypesEmailsQueryModify }
