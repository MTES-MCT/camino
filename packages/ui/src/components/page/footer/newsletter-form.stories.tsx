import { Meta, StoryFn } from '@storybook/vue3'
import { PureNewsletterForm } from './newsletter-form'

const meta: Meta = {
  title: 'Pages/NewsletterForm',
  component: PureNewsletterForm,
}
export default meta

export const NonAbonné: StoryFn = () => <PureNewsletterForm state={'NOT_SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />

export const Abonné: StoryFn = () => <PureNewsletterForm state={'SUBSCRIBED'} onEmailInput={() => ({})} onSubscribe={() => ({})} />

export const EnCours: StoryFn = () => <PureNewsletterForm state={'SUBSCRIBING'} onEmailInput={() => ({})} onSubscribe={() => ({})} />

export const Error: StoryFn = () => <PureNewsletterForm state={'ERROR'} onEmailInput={() => ({})} onSubscribe={() => ({})} />
