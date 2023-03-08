import { PureAdministration } from './administration'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

import { AdministrationId, ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { administrationMetas } from './administration/permissions.stub'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Administration',
  component: PureAdministration,
  argTypes: {},
}
export default meta
const administrationActiviteTypeEmailUpdateAction = action('administrationActiviteTypeEmailUpdate')
const administrationActiviteTypeEmailDeleteAction = action('administrationActiviteTypeEmailDelete')

export const Default: Story = () => (
  <PureAdministration
    administrationId={ADMINISTRATION_IDS.BRGM}
    user={{
      role: 'super',
      ...testBlankUser,
    }}
    apiClient={{
      administrationActivitesTypesEmails: (_: AdministrationId) =>
        Promise.resolve([
          {
            email: 'toto@toto.com',
            activiteTypeId: ACTIVITES_TYPES_IDS["rapport d'exploitation (autorisations M)"],
          },
        ]),
      administrationUtilisateurs: (_: AdministrationId) =>
        Promise.resolve([
          {
            prenom: 'Jean',
            nom: 'Michel',
            email: 'jean.michel@gmail.com',
            id: 'jeanmichel',
            role: 'super',
            administrationId: undefined,
          },
        ]),
      administrationActiviteTypeEmailUpdate: () => {
        administrationActiviteTypeEmailUpdateAction()
        return Promise.resolve()
      },
      administrationActiviteTypeEmailDelete: () => {
        administrationActiviteTypeEmailDeleteAction()
        return Promise.resolve()
      },
      administrationMetas,
    }}
  />
)
