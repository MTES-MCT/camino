import ActivitesTypesEmails from './activites-types-emails.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  ActivitesTypesId,
  ACTIVITES_TYPES_IDS
} from 'camino-common/src/static/activitesTypes'
import { User } from '@sentry/vue'
import {
  Administration,
  Administrations,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations'

const meta: Meta = {
  title: 'Components/Administration/ActivitesTypesEmails',
  component: ActivitesTypesEmails
}
export default meta

type Props = {
  administration: Administration
  user: User
  activitesTypesEmails: { activiteTypeId: ActivitesTypesId; email: string }[]
}

const activitesTypesEmails = [
  {
    activiteTypeId:
      ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"],
    email: 'foo@bar.co'
  },
  {
    activiteTypeId: ACTIVITES_TYPES_IDS['rapport d’intensité d’exploration'],
    email: 'toto@tata.com'
  }
]

const Template: Story<Props> = (args: Props) => ({
  components: { ActivitesTypesEmails },
  setup() {
    return { args }
  },
  template: '<ActivitesTypesEmails v-bind="args" />'
})

export const EmailLectureVisible = Template.bind({})
EmailLectureVisible.args = {
  administration: Administrations['aut-97300-01'],
  activitesTypesEmails
}

export const EmailLectureAndModificationVisible = Template.bind({})
EmailLectureAndModificationVisible.args = {
  administration: Administrations['aut-97300-01'],
  user: {
    role: 'admin',
    administrationId:
      ADMINISTRATION_IDS[
        "DAJ - MINISTÈRE DE L'ECONOMIE, DES FINANCES ET DE LA RELANCE"
      ]
  },
  activitesTypesEmails
}

export const EmailLectureAndModificationSurAdministrationVisible =
  Template.bind({})
EmailLectureAndModificationSurAdministrationVisible.args = {
  administration: Administrations[ADMINISTRATION_IDS['DREAL - BRETAGNE']],
  user: {
    role: 'admin',
    administrationId: ADMINISTRATION_IDS['DREAL - BRETAGNE']
  },
  activitesTypesEmails
}
