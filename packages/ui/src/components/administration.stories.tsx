import { PureAdministration } from './administration'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'

import { AdministrationId, ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { ACTIVITES_TYPES_IDS } from 'camino-common/src/static/activitesTypes'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { toUtilisateurId } from 'camino-common/src/roles'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Administration',
  component: PureAdministration,
  decorators: [vueRouter([{ name: 'utilisateur', params: { id: 'jeanmichel' } }, { name: '/plop' }])],
}
export default meta
const administrationActiviteTypeEmailUpdateAction = action('administrationActiviteTypeEmailUpdate')
const administrationActiviteTypeEmailDeleteAction = action('administrationActiviteTypeEmailDelete')

export const Default: StoryFn = () => (
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
            id: toUtilisateurId('jeanmichel'),
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
    }}
  />
)
