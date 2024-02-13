import { Meta, StoryFn } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { PureTitreCreation } from './titre-creation'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ApiClient } from '@/api/api-client'
import { entrepriseIdValidator } from 'camino-common/src/entreprise'

const meta: Meta = {
  title: 'Components/TitreCreation',
  // @ts-ignore
  component: PureTitreCreation,
  decorators: [vueRouter([{ name: 'meta' }])],
}
export default meta


const apiClient: Pick<ApiClient, 'getEntreprisesTitresCreation'> = {
  getEntreprisesTitresCreation: () => {
    return Promise.resolve([{id: entrepriseIdValidator.parse('id1'), nom: 'entreprise 1'}, {id: entrepriseIdValidator.parse('id2'), nom: 'entreprise 2'}])
  },
}

export const Default: StoryFn = () => <PureTitreCreation user={{...testBlankUser, role: 'super'}} apiClient={apiClient} />
export const OnlyOneEntreprise: StoryFn = () => <PureTitreCreation user={{...testBlankUser, role: 'super'}} apiClient={{...apiClient, getEntreprisesTitresCreation: () => {
  return Promise.resolve([{id: entrepriseIdValidator.parse('id1'), nom: 'entreprise 1'}])
},}} />

export const OnlyOneEntrepriseUserEntreprise: StoryFn = () => <PureTitreCreation user={{...testBlankUser, role: 'entreprise', entreprises: []}} apiClient={{...apiClient, getEntreprisesTitresCreation: () => {
  return Promise.resolve([{id: entrepriseIdValidator.parse('id1'), nom: 'entreprise 1'}])
},}} />
