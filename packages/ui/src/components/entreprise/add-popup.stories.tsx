import { EntrepriseAddPopup } from './add-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { action } from '@storybook/addon-actions'

const meta: Meta = {
  title: 'Components/Entreprise/Ajout',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: EntrepriseAddPopup,
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
export const Super: StoryFn = () => <EntrepriseAddPopup close={close} user={{ ...testBlankUser, role: 'super' }} apiClient={apiClient} />
