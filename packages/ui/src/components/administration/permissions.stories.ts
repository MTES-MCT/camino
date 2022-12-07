import Permissions from './permissions.vue'
import { Meta, Story } from '@storybook/vue3'
import {
  AdministrationId,
  ADMINISTRATION_IDS
} from 'camino-common/src/static/administrations'
import { ApiClient } from '@/api/api-client.js'

const meta: Meta = {
  title: 'Components/Administration/Permissions',
  component: Permissions
}
export default meta

type Props = {
  administrationId: AdministrationId
  apiClient: Pick<ApiClient, 'administrationMetas'>
}

const Template: Story<Props> = (args: Props) => ({
  components: { Permissions },
  setup() {
    return { args }
  },
  template: '<Permissions v-bind="args" />'
})

export const Default = Template.bind(
  {},
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    apiClient: {
      administrationMetas: () =>
        Promise.resolve({
          titresTypesTitresStatuts: [
            {
              titreType: {
                id: 'axm'
              },
              titreStatutId: 'val',
              titresModificationInterdit: true,
              etapesModificationInterdit: false,
              demarchesModificationInterdit: true
            }
          ],
          activitesTypes: [
            {
              id: 'gra',
              modificationInterdit: true,
              lectureInterdit: false
            }
          ],
          titresTypesEtapesTypes: [
            {
              etapeType: {
                id: 'dpu'
              },
              titreType: {
                id: 'axm'
              },
              titreStatutId: 'val',
              creationInterdit: true,
              modificationInterdit: false,
              lectureInterdit: true
            }
          ]
        })
    }
  }
)

export const error = Template.bind(
  {},
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    apiClient: { administrationMetas: () => Promise.reject(new Error('')) }
  }
)

export const Loading = Template.bind(
  {},
  {
    administrationId: ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS'],
    apiClient: { administrationMetas: () => new Promise(() => ({})) }
  }
)
