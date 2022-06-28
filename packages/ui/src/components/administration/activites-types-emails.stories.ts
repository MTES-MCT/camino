import ActivitesTypesEmails from './activites-types-emails.vue'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/ActivitesTypesEmails',
  component: ActivitesTypesEmails
}
export default meta

type Props = {
  administration: unknown
  activitesTypes: { id: string; nom: string }[]
}

const administration = {
  id: 'id',
  email: 'foo@bar.co',
  nom: 'nom',
  emailsLecture: false,
  emailsModification: false,
  activitesTypesEmails: [
    {
      id: 'grx',
      nom: "rapport d'exploitation (autorisations M)",
      email: 'foo@bar.co'
    },
    {
      id: 'pma',
      nom: 'rapport d’intensité d’exploration',
      email: 'toto@tata.com'
    }
  ]
}

const activitesTypes = [
  { id: 'grx', nom: 'grx' },
  { id: 'pma', nom: 'pma' }
]

const Template: Story<Props> = (args: Props) => ({
  components: { ActivitesTypesEmails },
  setup() {
    return { args }
  },
  template: '<ActivitesTypesEmails v-bind="args" />'
})

export const EmailNonVisible = Template.bind({})
EmailNonVisible.args = {
  administration,
  activitesTypes
}

export const EmailLectureVisible = Template.bind({})
EmailLectureVisible.args = {
  administration: { ...administration, emailsLecture: true },
  activitesTypes
}

export const EmailLectureAndModificationVisible = Template.bind({})
EmailLectureAndModificationVisible.args = {
  administration: {
    ...administration,
    emailsLecture: true,
    emailsModification: true
  },
  activitesTypes
}

export const EmailLectureAndModificationSurAdministrationVisible =
  Template.bind({})
EmailLectureAndModificationSurAdministrationVisible.args = {
  administration: {
    ...administration,
    emailsLecture: true,
    emailsModification: true,
    type: { id: 'dea' }
  },
  activitesTypes
}
