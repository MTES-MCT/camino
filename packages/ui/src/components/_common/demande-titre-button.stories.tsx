import { Meta, StoryFn } from '@storybook/vue3'

import { DemandeTitreButton } from './demande-titre-button'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/Common/DemandeTitreButton',
  component: DemandeTitreButton,
  decorators: [vueRouter([{ name: 'titre-creation' }]), () => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const UserEntreprise: StoryFn = () => <DemandeTitreButton user={{ ...testBlankUser, role: 'entreprise', entreprises: [] }} />

export const DefaultCannotCreateTitre: StoryFn = () => (
  <div>
    <DemandeTitreButton user={null} />
  </div>
)
