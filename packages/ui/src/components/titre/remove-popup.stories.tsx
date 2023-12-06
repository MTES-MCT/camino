import { RemovePopup } from './remove-popup'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { titreIdValidator } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/RemovePopup',
  component: RemovePopup,
}
export default meta

const deleteTitreAction = action('deleteTitre')
const close = action('close')
const reloadAction = action('reload')
const reload = () => {
  reloadAction()

  return Promise.resolve()
}

export const Default: StoryFn = () => (
  <RemovePopup
    titreId={titreIdValidator.parse('idTitre')}
    close={close}
    reload={reload}
    apiClient={{
      removeTitre: (...params) => {
        deleteTitreAction(params)

        return Promise.resolve()
      },
    }}
    titreNom="Nom du titre"
    titreTypeId="arm"
  />
)
