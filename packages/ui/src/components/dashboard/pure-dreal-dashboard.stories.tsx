import { PureDrealDashboard } from './pure-dreal-dashboard'
import { Meta, Story } from '@storybook/vue3'
import { CommonTitreDREAL } from 'camino-common/src/titres'
import { statistiquesDGTMFake, titresDreal } from './testData'
const meta: Meta = {
  title: 'Components/Dashboard/DREAL',
  component: PureDrealDashboard,
  argTypes: {
    getEntreprisesTitres: { name: 'function', required: true },
    displayActivites: { name: 'boolean' }
  }
}
export default meta

export const Ok: Story = () => (
  <PureDrealDashboard
    getDrealTitres={() => Promise.resolve(titresDreal)}
    isDGTM={false}
    getDgtmStats={() =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
    }
  />
)

export const OkWithoutBlockedTitres: Story = () => (
  <PureDrealDashboard
    getDrealTitres={() =>
      Promise.resolve(titresDreal.filter(t => !t.enAttenteDeDREAL))
    }
    isDGTM={false}
    getDgtmStats={() =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
    }
  />
)

export const DGTMNoSnapshot: Story = () => (
  <PureDrealDashboard
    getDrealTitres={() => Promise.resolve(titresDreal)}
    isDGTM={true}
    getDgtmStats={() => Promise.resolve(statistiquesDGTMFake)}
  />
)

export const Loading: Story = () => (
  <PureDrealDashboard
    getDrealTitres={() => new Promise<CommonTitreDREAL[]>(_resolve => {})}
    isDGTM={false}
    getDgtmStats={() =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
    }
  />
)
export const WithError: Story = () => (
  <PureDrealDashboard
    getDrealTitres={() => Promise.reject(new Error('because reasons'))}
    isDGTM={false}
    getDgtmStats={() =>
      Promise.resolve({
        depotEtInstructions: {},
        sdom: {},
        delais: {},
        avisAXM: {},
        producteursOr: {}
      })
    }
  />
)
