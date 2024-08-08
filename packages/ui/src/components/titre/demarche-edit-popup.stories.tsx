import { DemarcheEditPopup, Props } from './demarche-edit-popup'
import { Meta, StoryFn, StoryObj } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { demarcheIdValidator, demarcheSlugValidator } from 'camino-common/src/demarche'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { expect, userEvent, within } from '@storybook/test'

const meta = {
  title: 'Components/Titre/DemarcheEditPopup',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx
  component: DemarcheEditPopup,
} satisfies Meta<typeof DemarcheEditPopup>
export default meta
type Story = StoryObj<typeof meta>

const create = action('create')
const update = action('update')
const close = action('close')

const reload = action('reload')

const apiClient: Props['apiClient'] = {
  createDemarche: demarche => {
    create(demarche)

    return new Promise(resolve => setTimeout(() => resolve({ slug: demarcheSlugValidator.parse('newDemarcheSlug') }), 1000))
  },
  updateDemarche: demarche => {
    update(demarche)

    return new Promise(resolve => setTimeout(() => resolve(demarcheSlugValidator.parse('editDemarcheSlug')), 1000))
  },
}

export const Create: StoryFn = () => (
  <DemarcheEditPopup reload={reload} apiClient={apiClient} close={close} demarche={{ titreId: titreIdValidator.parse('titreId') }} titreTypeId={'apc'} titreNom="Nom du titre" tabId="demarches" />
)
export const Edit: StoryFn = () => (
  <DemarcheEditPopup
    reload={reload}
    apiClient={apiClient}
    close={close}
    demarche={{
      titreId: titreIdValidator.parse('titreId'),
      id: demarcheIdValidator.parse('demarcheId'),
      typeId: 'amo',
      description: 'description',
    }}
    titreTypeId={'cxf'}
    titreNom="Nom du titre"
    tabId="demarches"
  />
)

export const DisplayErrorMessage: Story = {
  args: {
    reload,
    apiClient: {
      ...apiClient,
      createDemarche: () => {
        return new Promise(resolve => setTimeout(() => resolve({ message: 'Grosse erreur' })))
      },
    },
    close,
    demarche: { titreId: titreIdValidator.parse('titreId'), typeId: 'oct' },
    titreTypeId: 'cxf',
    titreNom: 'Nom du titre',
    tabId: 'demarches',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Enregistrer'))

    const errorDiv = await canvas.findByText('Grosse erreur')
    expect(errorDiv).not.toBe(undefined)
  },
}
