import { Alert } from './alert'
import { Meta, StoryFn } from '@storybook/vue3'

const meta: Meta = {
  title: 'Components/UI/Alert',
  component: Alert,
  argTypes: {},
}
export default meta

export const Success: StoryFn = () => (
  <div class="dsfr">
    <Alert type="success" title="C’est un succès" description={() => <span class="fr-text--bold">Description en gras</span>} />
  </div>
)

export const Warning: StoryFn = () => (
  <div class="dsfr">
    <Alert type="warning" title="Attention" description={() => <span class="fr-text--bold">Description en gras</span>} />
  </div>
)

export const Erreur: StoryFn = () => (
  <div class="dsfr">
    <Alert type="error" title="Erreur" description={() => <span class="fr-text--bold">Description en gras</span>} />
  </div>
)

export const Info: StoryFn = () => (
  <div class="dsfr">
    <Alert type="info" title="Informations" description={() => <span class="fr-text--bold">Description en gras</span>} />
  </div>
)

export const InfoSansDescription: StoryFn = () => (
  <div class="dsfr">
    <Alert type="info" title="Informations" />
  </div>
)

export const InfoSmall: StoryFn = () => (
  <div class="dsfr">
    <Alert type="info" title="Informations" small={true} />
  </div>
)
