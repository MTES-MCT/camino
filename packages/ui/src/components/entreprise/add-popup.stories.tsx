import { EntrepriseAddPopup } from './add-popup'
import { Meta, Story } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'
import { newEntrepriseId } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/Entreprise/Ajout',
  component: EntrepriseAddPopup,
  argTypes: {},
}
export default meta

const close = action('close')
const save = action('save')

const apiClient = {
  creerEntreprise: (...params: unknown[]) => {
    save(params)
    return Promise.resolve()
  },
}
export const Super: Story = () => <EntrepriseAddPopup close={close} user={{ ...testBlankUser, role: 'super' }} apiClient={apiClient} />