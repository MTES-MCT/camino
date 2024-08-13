import { Meta, StoryFn } from '@storybook/vue3'

import { DemandeTitreButton } from './demande-titre-button'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Common/DemandeTitreButton',
  component: DemandeTitreButton,
}
export default meta

export const UserEntreprise: StoryFn = () => <DemandeTitreButton user={{ ...testBlankUser, role: 'entreprise', entrepriseIds: [] }} />

export const DefaultCannotCreateTitre: StoryFn = () => (
  <div>
    <DemandeTitreButton user={null} />
  </div>
)
