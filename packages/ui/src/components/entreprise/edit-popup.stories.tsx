import { EntrepriseEditPopup } from './edit-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Entreprise/Edition',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: EntrepriseEditPopup,
}
export default meta

const close = action('close')
const save = action('save')

const apiClient = {
  modifierEntreprise: (...params: unknown[]) => {
    save(params)

    return Promise.resolve()
  },
}
export const Ok: StoryFn = () => (
  <EntrepriseEditPopup
    close={close}
    user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' }}
    entreprise={{ id: newEntrepriseId('id'), telephone: '0102030405', email: null, archive: false, url: null }}
    apiClient={apiClient}
  />
)

export const Super: StoryFn = () => (
  <EntrepriseEditPopup
    close={close}
    user={{ ...testBlankUser, role: 'super' }}
    entreprise={{ id: newEntrepriseId('id'), telephone: '0102030405', email: null, archive: false, url: null }}
    apiClient={apiClient}
  />
)
