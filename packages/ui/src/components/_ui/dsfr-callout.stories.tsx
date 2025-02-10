import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrCallout } from './dsfr-callout'

const meta: Meta = {
  title: 'Components/UI/Dsfr/Callout',
  component: DsfrCallout,
}
export default meta

export const Default: StoryFn = () => <DsfrCallout title="Mon title" content={<>Ceci est le contenu</>} footer={<>Ceci est le footer</>} />
