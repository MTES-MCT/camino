import { Meta, StoryFn } from '@storybook/vue3'
import { PureNewsletterForm } from './newsletter-form'

const meta: Meta = {
  title: 'Pages/NewsletterForm',
  component: PureNewsletterForm,
}
export default meta

export const NonAbonné: StoryFn = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'NOT_SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const Abonné: StoryFn = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const EnCours: StoryFn = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'SUBSCRIBING'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const Error: StoryFn = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'ERROR'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)
