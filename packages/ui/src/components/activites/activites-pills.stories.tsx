import { Meta, StoryFn } from '@storybook/vue3'
import { ActivitesPills } from './activites-pills'

const meta: Meta = {
  title: 'Components/Activites/Pills',
  component: ActivitesPills,
}
export default meta

export const Default: StoryFn = () => <ActivitesPills />
export const WithActivitesAbsentes: StoryFn = () => <ActivitesPills activitesAbsentes={2} />
export const WithActivitesEnConstruction: StoryFn = () => <ActivitesPills activitesEnConstruction={2} />
export const Both: StoryFn = () => <ActivitesPills activitesEnConstruction={2} activitesAbsentes={12} />
