import Administration from './pure-administration.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  AdministrationId,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations'
import { User } from 'camino-common/src/roles'
import { ActiviteTypeEmail, ApiClient } from '@/api/api-client'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'

const meta: Meta = {
  title: 'Page/Administration',
  component: Administration,
  argTypes: {}
}
export default meta

type Props = {
  administrationId: AdministrationId
  user: User
  apiClient: ApiClient
}

const Template: Story<Props> = (args: Props) => ({
  components: { Administration },
  setup() {
    return { args }
  },
  template: '<Administration v-bind="args" />'
})

export const Default = Template.bind(
  {},
  {
    administrationId: ADMINISTRATION_IDS.BRGM,
    user: {
      role: 'super',
      administrationId: undefined
    },
    apiClient: {
      activitesTypesEmails: (_: AdministrationId) =>
        Promise.resolve([
          {
            email: 'toto@toto.com',
            activiteTypeId:
              ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"]
          }
        ]),
      administrationUtilisateurs: (_: AdministrationId) =>
        Promise.resolve([
          {
            prenom: 'Jean',
            nom: 'Michel',
            email: 'jean.michel@gmail.com',
            id: 'jeanmichel',
            role: 'super',
            administrationId: undefined
          }
        ]),
      administrationActiviteTypeEmailUpdate: activiteTypeEmail => {
        console.log(`update ${activiteTypeEmail}`)
      },
      administrationActiviteTypeEmailDelete: activiteTypeEmail => {
        console.log(`delete ${activiteTypeEmail}`)
      }
    }
  }
)
