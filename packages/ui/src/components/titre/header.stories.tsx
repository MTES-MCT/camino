import { PureHeader } from './header'
import { Meta, Story } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { TitreApiClient } from './titre-api-client'

const meta: Meta = {
  title: 'Components/Titre/Header',
  component: PureHeader,
  argTypes: {},
}
export default meta

const emailSend = action('emailSend')
const removeTitre = action('removeTitre')
const titreUtilisateurAbonne = action('titreUtilisateurAbonne')

const apiClientMock: Omit<TitreApiClient, 'loadTitreSections'> = {
  removeTitre: async titreId => {
    removeTitre(titreId)
    return Promise.resolve()
  },
  titreUtilisateurAbonne: async (...params) => {
    titreUtilisateurAbonne(params)
    return Promise.resolve()
  },
}
export const Default: Story = () => (
  <PureHeader
    titre={{
      abonnement: false,
      id: 'id',
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'defaut' }}
    apiClient={apiClientMock}
  />
)

export const AbonneAuTitre: Story = () => (
  <PureHeader
    titre={{
      abonnement: true,
      id: 'id',
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'defaut' }}
    apiClient={apiClientMock}
  />
)

export const CanDeleteTitre: Story = () => (
  <PureHeader
    titre={{
      abonnement: false,
      id: 'id',
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClientMock}
  />
)

export const CanEditTitre: Story = () => (
  <PureHeader
    titre={{
      abonnement: false,
      id: 'id',
      modification: true,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClientMock}
  />
)
