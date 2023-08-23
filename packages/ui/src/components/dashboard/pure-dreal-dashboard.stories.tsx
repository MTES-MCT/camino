import { PureDrealDashboard } from './pure-dreal-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { statistiquesDGTMFake, titresDreal } from './testData'
import { vueRouter } from 'storybook-vue3-router'
const meta: Meta = {
  title: 'Components/Dashboard/DREAL',
  component: PureDrealDashboard,
  decorators: [
    vueRouter([
      { name: 'titre', params: { id: 'fourth-slug' } },
      { name: 'Stats DGTM', params: {} },
    ]),
  ],
}
export default meta

export const Ok: StoryFn = () => (
  <PureDrealDashboard
    isDGTM={false}
    apiClient={{
      getDrealTitres: () => Promise.resolve(titresDreal),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
  />
)

export const OkWithoutBlockedTitres: StoryFn = () => (
  <PureDrealDashboard
    apiClient={{
      getDrealTitres: () => Promise.resolve(titresDreal.filter(t => !t.enAttenteDeDREAL)),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
    isDGTM={false}
  />
)

export const DGTMNoSnapshot: StoryFn = () => (
  <PureDrealDashboard apiClient={{ getDrealTitres: () => Promise.resolve(titresDreal), getDgtmStats: () => Promise.resolve(statistiquesDGTMFake) }} isDGTM={true} />
)

export const Loading: StoryFn = () => (
  <PureDrealDashboard
    isDGTM={false}
    apiClient={{
      getDrealTitres: () => new Promise<CommonTitreDREAL[]>(_resolve => {}),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
  />
)
export const WithError: StoryFn = () => (
  <PureDrealDashboard
    apiClient={{
      getDrealTitres: () => Promise.reject(new Error('because reasons')),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
    isDGTM={false}
  />
)
