import { ActivitesTypesEmails } from './activites-types-emails'
import { Meta, StoryFn } from '@storybook/vue3'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Administration/ActivitesTypesEmails',
  component: ActivitesTypesEmails,
}
export default meta

const activitesTypesEmails = [
  {
    activite_type_id: ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"],
    email: 'foo@bar.co',
  },
  {
    activite_type_id: ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration'],
    email: 'toto@tata.com',
  },
]

const emailUpdate = action('emailUpdate')
const emailDelete = action('emailDelete')
export const EmailLectureVisible: StoryFn = () => (
  <ActivitesTypesEmails administrationId="aut-97300-01" user={null} activitesTypesEmails={activitesTypesEmails} emailUpdate={emailUpdate} emailDelete={emailDelete} />
)

export const EmailLectureAndModificationVisible: StoryFn = () => (
  <ActivitesTypesEmails
    administrationId="aut-97300-01"
    user={{
      role: 'admin',
      administrationId: ADMINISTRATION_IDS["DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"],
      ...testBlankUser,
    }}
    activitesTypesEmails={activitesTypesEmails}
    emailUpdate={emailUpdate}
    emailDelete={emailDelete}
  />
)

export const EmailLectureAndModificationSurAdministrationVisible: StoryFn = () => (
  <ActivitesTypesEmails
    administrationId={ADMINISTRATION_IDS['DREAL - BRETAGNE']}
    user={{
      role: 'admin',
      administrationId: ADMINISTRATION_IDS['DREAL - BRETAGNE'],
      ...testBlankUser,
    }}
    activitesTypesEmails={activitesTypesEmails}
    emailUpdate={emailUpdate}
    emailDelete={emailDelete}
  />
)
