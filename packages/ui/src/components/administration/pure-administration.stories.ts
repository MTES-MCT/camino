import Administration from './pure-administration.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  AdministrationId,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations'
import { User } from 'camino-common/src/roles'
import { ApiClient } from '@/api/api-client'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { administrationMetas } from './permissions.stub'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Administration/Administration',
  component: Administration,
  argTypes: {}
}
export default meta

type Props = {
  administrationId: AdministrationId
  user: User
  apiClient: Pick<
    ApiClient,
    | 'administrationActivitesTypesEmails'
    | 'administrationUtilisateurs'
    | 'administrationMetas'
    | 'administrationActiviteTypeEmailUpdate'
    | 'administrationActiviteTypeEmailDelete'
  >
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
      ...testBlankUser
    },
    apiClient: {
      administrationActivitesTypesEmails: (_: AdministrationId) =>
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
      administrationActiviteTypeEmailUpdate: () => Promise.resolve(),
      administrationActiviteTypeEmailDelete: () => Promise.resolve(),
      administrationMetas
    }
  }
)
