import { PureHeader } from './header'
import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { testBlankUser } from 'camino-common/src/tests-utils'
import { TitreApiClient } from './titre-api-client'
import { toCaminoDate } from 'camino-common/src/date'

const meta: Meta = {
  title: 'Components/Titre/Header',
  component: PureHeader,
  argTypes: {},
}
export default meta

const emailSend = action('emailSend')
const removeTitre = action('removeTitre')
const titreUtilisateurAbonne = action('titreUtilisateurAbonne')
const editTitre = action('editTitre')
const getLastModifiedDateAction = action('getLastModifiedDate')

const apiClientMock: Pick<TitreApiClient, 'titreUtilisateurAbonne' | 'editTitre' | 'removeTitre' | 'getLastModifiedDate'> = {
  removeTitre: async titreId => {
    removeTitre(titreId)
    return Promise.resolve()
  },
  titreUtilisateurAbonne: async (...params) => {
    titreUtilisateurAbonne(params)
    return Promise.resolve()
  },
  editTitre: async (...params) => {
    editTitre(params)
    return Promise.resolve()
  },
  getLastModifiedDate: async (...params) => {
    getLastModifiedDateAction(params)
    return Promise.resolve(toCaminoDate('2022-01-01'))
  },
}
export const Default: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [],
      abonnement: false,
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'defaut' }}
    apiClient={apiClientMock}
  />
)

export const AbonneAuTitre: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [],
      abonnement: true,
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'defaut' }}
    apiClient={apiClientMock}
  />
)

export const CanDeleteTitre: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [],
      abonnement: false,
      modification: false,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClientMock}
  />
)

export const CanEditTitre: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [{ nom: 'cette-ref', referenceTypeId: 'brg' }],
      abonnement: false,
      modification: true,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={apiClientMock}
  />
)

export const Loading: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [{ nom: 'cette-ref', referenceTypeId: 'brg' }],
      abonnement: false,
      modification: true,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={{
      ...apiClientMock,
      getLastModifiedDate: (titreId: string) => {
        return new Promise(() => ({}))
      },
    }}
  />
)

export const WithError: StoryFn = () => (
  <PureHeader
    titre={{
      id: 'id',
      references: [{ nom: 'cette-ref', referenceTypeId: 'brg' }],
      abonnement: false,
      modification: true,
      nom: 'Nom titre',
      typeId: 'arm',
    }}
    emailSend={emailSend}
    user={{ ...testBlankUser, role: 'super' }}
    apiClient={{
      ...apiClientMock,
      getLastModifiedDate: (_: string) => {
        throw new Error('erreur lors de la récupération de la date')
      },
    }}
  />
)
