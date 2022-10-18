import ActivitesTypesEmails from './activites-types-emails.vue'
import { Meta, Story } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Administration/ActivitesTypesEmails',
  component: ActivitesTypesEmails
}
export default meta

type Props = {
  administration: unknown
  activitesTypes: { id: string; nom: string }[]
  activitesTypesEmails: { activiteTypeId: string; nom: string; email: string }[]
}

const administration = {
  id: 'id',
  email: 'foo@bar.co',
  nom: 'nom',
  emailsModification: false
}

const activitesTypesEmails = [
  {
    activiteTypeId: 'grx',
    nom: "rapport d'exploitation (autorisations M)",
    email: 'foo@bar.co'
  },
  {
    activiteTypeId: 'pma',
    nom: 'rapport d’intensité d’exploration',
    email: 'toto@tata.com'
  }
]

const activitesTypes = [
  { id: 'grx', nom: "Rapport d'exploitation (autorisations M)" },
  { id: 'pma', nom: 'Rapport d’intensité d’exploration' }
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
  administration,
  activitesTypes,
  activitesTypesEmails
}

export const EmailLectureAndModificationVisible = Template.bind({})
EmailLectureAndModificationVisible.args = {
  administration: {
    ...administration,
    emailsModification: true
  },
  activitesTypes,
  activitesTypesEmails
}

export const EmailLectureAndModificationSurAdministrationVisible =
  Template.bind({})
EmailLectureAndModificationSurAdministrationVisible.args = {
  administration: {
    ...administration,
    emailsModification: true,
    type: { id: 'dea' }
  },
  activitesTypes,
  activitesTypesEmails
}
