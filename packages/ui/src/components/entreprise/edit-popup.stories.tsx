import { EntrepriseEditPopup } from './edit-popup'
import { Meta, Story } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Entreprise/Edition',
  component: EntrepriseEditPopup,
  argTypes: {},
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
export const Ok: Story = () => (
  <EntrepriseEditPopup
    close={close}
    user={{ ...testBlankUser, role: 'admin', administrationId: 'aut-97300-01' }}
    entreprise={{ id: newEntrepriseId('id'), telephone: '0102030405' }}
    apiClient={apiClient}
  />
)

export const Super: Story = () => (
  <EntrepriseEditPopup close={close} user={{ ...testBlankUser, role: 'super' }} entreprise={{ id: newEntrepriseId('id'), telephone: '0102030405' }} apiClient={apiClient} />
)
