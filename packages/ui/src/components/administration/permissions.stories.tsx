import { Permissions } from './permissions'
import { Meta, StoryFn } from '@storybook/vue3'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { administrationMetas } from './permissions.stub'

const meta: Meta = {
  title: 'Components/Administration/Permissions',
  component: Permissions,
}
export default meta

export const Default: StoryFn = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas,
    }}
  />
)

export const WithError: StoryFn = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas: () => Promise.reject(new Error('')),
    }}
  />
)

export const Loading: StoryFn = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas: () => new Promise(() => ({})),
    }}
  />
)
