import { action } from '@storybook/addon-actions'
import { Meta, StoryFn } from '@storybook/vue3'
import { TitreApiClient } from './titre-api-client'
import { titreIdValidator } from 'camino-common/src/validators/titres'
import { TitreAbonnerButton } from './titre-abonner-button'
import { testBlankUser } from 'camino-common/src/tests-utils'

const meta: Meta = {
  title: 'Components/Titre/AbonnerButton',
  // @ts-ignore storybook est encore perdu avec les tsx
  component: TitreAbonnerButton,
  decorators: [() => ({ template: '<div class="dsfr"><story/></div>' })],
}
export default meta

const getTitreUtilisateurAbonneAction = action('getTitreUtilisateurAbonne')
const titreUtilisateurAbonneAction = action('titreUtilisateurAbonne')
const apiClient: Pick<TitreApiClient, 'getTitreUtilisateurAbonne' | 'titreUtilisateurAbonne'> = {
  getTitreUtilisateurAbonne: titreId => {
    getTitreUtilisateurAbonneAction(titreId)

    return Promise.resolve(true)
  },

  titreUtilisateurAbonne: (...params) => {
    titreUtilisateurAbonneAction(params)

    return Promise.resolve()
  },
}
const titreId = titreIdValidator.parse('titreId')
export const NotConnectedUser: StoryFn = () => <TitreAbonnerButton user={null} titreId={titreId} apiClient={apiClient} />
export const AlreadyAbonne: StoryFn = () => <TitreAbonnerButton user={{ ...testBlankUser, role: 'super' }} titreId={titreId} apiClient={apiClient} />
export const NotAbonne: StoryFn = () => (
  <TitreAbonnerButton
    user={{ ...testBlankUser, role: 'super' }}
    titreId={titreId}
    apiClient={{
      ...apiClient,
      getTitreUtilisateurAbonne: titreId => {
        getTitreUtilisateurAbonneAction(titreId)

        return Promise.resolve(false)
      },
    }}
  />
)
export const Loading: StoryFn = () => (
  <TitreAbonnerButton user={{ ...testBlankUser, role: 'super' }} titreId={titreId} apiClient={{ ...apiClient, getTitreUtilisateurAbonne: () => new Promise(() => ({})) }} />
)
export const WithError: StoryFn = () => (
  <TitreAbonnerButton
    user={{ ...testBlankUser, role: 'super' }}
    titreId={titreId}
    apiClient={{ ...apiClient, getTitreUtilisateurAbonne: () => Promise.reject(new Error('Une erreur est survenue')) }}
  />
)
