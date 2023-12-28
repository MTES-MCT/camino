import { Alert } from './alert'
import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrLink } from './dsfr-button'
import { vueRouter } from 'storybook-vue3-router'

const meta: Meta = {
  title: 'Components/UI/Alert',
  component: Alert,
  decorators: [vueRouter([{ name: 'value' }]), () => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

export const Success: StoryFn = () => <Alert type="success" title="C’est un succès" description={<span class="fr-text--bold">Description en gras</span>} />
export const Warning: StoryFn = () => <Alert type="warning" title="Attention" description={<span class="fr-text--bold">Description en gras</span>} />
export const Erreur: StoryFn = () => <Alert type="error" title="Erreur" description={<span class="fr-text--bold">Description en gras</span>} />
export const Info: StoryFn = () => <Alert type="info" title="Informations" description={<span class="fr-text--bold">Description en gras</span>} />
export const InfoSansDescription: StoryFn = () => <Alert type="info" title="Informations" />
export const InfoSmall: StoryFn = () => <Alert type="info" title="Informations" small={true} />
export const InfoSmallLink: StoryFn = () => <Alert type="info" title={<DsfrLink icon={null} disabled={false} to={{ name: 'value' }} title="le titre du lien" />} small={true} />
