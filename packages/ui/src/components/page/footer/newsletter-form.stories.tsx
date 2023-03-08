import { Meta, Story } from '@storybook/vue3'
import { PureNewsletterForm } from './newsletter-form'

const meta: Meta = {
  title: 'Pages/NewsletterForm',
  component: PureNewsletterForm,
}
export default meta

export const NonAbonné: Story = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'NOT_SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const Abonné: Story = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const EnCours: Story = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'SUBSCRIBING'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)

export const Error: Story = () => (
  <div class="dsfr">
    <PureNewsletterForm state={'ERROR'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
  </div>
)
