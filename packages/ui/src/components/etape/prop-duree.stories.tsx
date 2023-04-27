import { PropDuree } from './prop-duree'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/Etape/PropDuree',
  component: PropDuree,
  argTypes: {},
}
export default meta

export const Empty: StoryFn = () => <PropDuree />
export const Mois: StoryFn = () => <PropDuree duree={1} />
export const OneYear: StoryFn = () => <PropDuree duree={12} />
export const TwoYears: StoryFn = () => <PropDuree duree={24} />
export const Full: StoryFn = () => <PropDuree duree={30} />
