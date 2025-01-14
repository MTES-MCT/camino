import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrAccordion } from './dsfr-accordion'

const meta: Meta = {
  title: 'Components/UI/DsfrAccordion',
  component: DsfrAccordion,
}
export default meta

export const Default: StoryFn = () => (
  <DsfrAccordion
    expandedByDefault={false}
    title="Un accordéon"
    content={
      <>
        <h3>Un contenu</h3>
      </>
    }
  />
)
export const Expanded: StoryFn = () => (
  <DsfrAccordion
    expandedByDefault
    title="Un accordéon"
    content={
      <>
        <h3>Un contenu</h3>
      </>
    }
  />
)
