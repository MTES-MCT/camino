import { ActiviteDeposePopup } from './depose-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { activiteIdValidator } from 'camino-common/src/activite'

const meta: Meta = {
  title: 'Components/Activite/DeposePopup',
  component: ActiviteDeposePopup,
}
export default meta

const close = action('close')
const deposerActiviteAction = action('deposerActiviteAction')

const apiClient = {
  deposerActivite: (...params: unknown[]) => {
    deposerActiviteAction(params)

    return Promise.resolve()
  },
}
export const Default: StoryFn = () => (
  <ActiviteDeposePopup close={close} apiClient={apiClient} activite={{ id: activiteIdValidator.parse('activiteId'), type_id: 'gra', titre: { nom: 'Titre 1', slug: 'slug' } }} />
)
