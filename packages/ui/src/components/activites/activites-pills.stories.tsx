import { Meta, Story } from '@storybook/vue3'
import { ActivitesPills } from './activites-pills'

const meta: Meta = {
  title: 'Components/Activites/Pills',
  component: ActivitesPills,
}
export default meta

export const Default: Story = () => <ActivitesPills />
export const WithActivitesAbsentes: Story = () => <ActivitesPills activitesAbsentes={2} />
export const WithActivitesEnConstruction: Story = () => <ActivitesPills activitesEnConstruction={2} />
export const Both: Story = () => <ActivitesPills activitesEnConstruction={2} activitesAbsentes={12} />
