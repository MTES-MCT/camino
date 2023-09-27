import { PureAdministrationDashboard } from './pure-administration-dashboard'
import { Meta, StoryFn } from '@storybook/vue3'
import { CommonTitreAdministration } from 'camino-common/src/titres'
import { statistiquesDGTMFake, titresDreal } from './testData'
import { vueRouter } from 'storybook-vue3-router'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { ADMINISTRATION_IDS } from 'camino-common/src/static/administrations'
const meta: Meta = {
  title: 'Components/Dashboard/Administration',
  component: PureAdministrationDashboard,
  decorators: [
    vueRouter([
      { name: 'titre', params: { id: 'fourth-slug' } },
      { name: 'Stats DGTM', params: {} },
    ]),
    () => ({ template: '<div class="dsfr"><story/></div>' }),
  ],
}
export default meta

export const Ok: StoryFn = () => (
  <PureAdministrationDashboard
    user={{ ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }}
    apiClient={{
      getAdministrationTitres: () => Promise.resolve(titresDreal),
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
  <PureAdministrationDashboard
    apiClient={{
      getAdministrationTitres: () => Promise.resolve(titresDreal.filter(t => !t.enAttenteDeAdministration)),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
    user={{ ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }}
  />
)

export const DGTMNoSnapshot: StoryFn = () => (
  <PureAdministrationDashboard
    apiClient={{ getAdministrationTitres: () => Promise.resolve(titresDreal), getDgtmStats: () => Promise.resolve(statistiquesDGTMFake) }}
    user={{ ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS['DGTM - GUYANE'] }}
  />
)

export const Loading: StoryFn = () => (
  <PureAdministrationDashboard
    user={{ ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }}
    apiClient={{
      getAdministrationTitres: () => new Promise<CommonTitreAdministration[]>(_resolve => {}),
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
  <PureAdministrationDashboard
    apiClient={{
      getAdministrationTitres: () => Promise.reject(new Error('because reasons')),
      getDgtmStats: () =>
        Promise.resolve({
          depotEtInstructions: {},
          sdom: {},
          delais: {},
          avisAXM: {},
          producteursOr: {},
        }),
    }}
    user={{ ...testBlankUser, role: 'admin', administrationId: ADMINISTRATION_IDS.BRGM }}
  />
)
