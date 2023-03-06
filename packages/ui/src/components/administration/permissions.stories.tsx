import { Permissions } from './permissions'
import { Meta, Story } from '@storybook/vue3'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
import { administrationMetas } from './permissions.stub'

const meta: Meta = {
  title: 'Components/Administration/Permissions',
  component: Permissions
}
export default meta

export const Default: Story = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas
    }}
  />
)

export const error: Story = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas: () => Promise.reject(new Error(''))
    }}
  />
)

export const Loading: Story = () => (
  <Permissions
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
    apiClient={{
      administrationMetas: () => new Promise(() => ({}))
    }}
  />
)
