import { TitresTypes } from './titres-types'
import { Meta, Story } from '@storybook/vue3'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'

const meta: Meta = {
  title: 'Components/Administration/TitresTypes',
  component: TitresTypes
}
export default meta

export const ONF: Story = () => (
  <TitresTypes
    administrationId={ADMINISTRATION_IDS['OFFICE NATIONAL DES FORÊTS']}
  />
)
