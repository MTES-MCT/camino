import { Alert, CaminoApiAlert } from './alert'
import { Meta, StoryFn } from '@storybook/vue3'
import { DsfrLink } from './dsfr-button'
import { CaminoZodErrorReadableMessage } from 'camino-common/src/zod-tools'

const meta: Meta = {
  title: 'Components/UI/Alert',
  component: Alert,
}
export default meta

export const Success: StoryFn = () => <Alert type="success" title="C’est un succès" description={<span class="fr-text--bold">Description en gras</span>} />
export const Warning: StoryFn = () => <Alert type="warning" title="Attention" description={<span class="fr-text--bold">Description en gras</span>} />
export const Erreur: StoryFn = () => <Alert type="error" title="Erreur" description={<span class="fr-text--bold">Description en gras</span>} />
export const Info: StoryFn = () => <Alert type="info" title="Informations" description={<span class="fr-text--bold">Description en gras</span>} />
export const InfoSansDescription: StoryFn = () => <Alert type="info" title="Informations" />
export const InfoSmall: StoryFn = () => <Alert type="info" title="Informations" small={true} />
export const InfoSmallLink: StoryFn = () => <Alert type="info" title={<DsfrLink icon={null} disabled={false} to={{ name: 'dashboard', params: {} }} title="le titre du lien" />} small={true} />

export const ApiErrorSimple: StoryFn = () => <CaminoApiAlert caminoApiError={{ message: "Ceci est une alerte de l'api" }} />
export const ApiErrorWithCompleteMessage: StoryFn = () => (
  <CaminoApiAlert
    caminoApiError={{
      message: "Ceci est une alerte de l'api",
      zodErrorReadableMessage: 'Validation error: Array must contain at least 3 element(s) at "features[0].geometry.coordinates[0][0]"' as CaminoZodErrorReadableMessage,
    }}
  />
)
export const ApiErrorWithDetail: StoryFn = () => (
  <CaminoApiAlert
    caminoApiError={{
      message: "Ceci est une alerte de l'api",
      detail: "Ceci est le détail human readable de l'erreur",
    }}
  />
)
export const ApiErrorWithDetailAndCompleteMessage: StoryFn = () => (
  <CaminoApiAlert
    caminoApiError={{
      message: "Ceci est une alerte de l'api",
      detail: "Ceci est le détail human readable de l'erreur",
      zodErrorReadableMessage: 'Validation error: Array must contain at least 3 element(s) at "features[0].geometry.coordinates[0][0]"' as CaminoZodErrorReadableMessage,
    }}
  />
)
