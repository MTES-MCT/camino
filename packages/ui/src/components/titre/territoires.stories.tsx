import { action } from '@storybook/addon-actions'
import { Territoires } from './territoires'
import { Meta, StoryFn } from '@storybook/vue3'
import { toCommuneId } from 'camino-common/src/static/communes'
import { TitreApiClient } from './titre-api-client'
import { titreIdValidator } from 'camino-common/src/titres'

const meta: Meta = {
  title: 'Components/Titre/Territoires',
  component: Territoires,
  argTypes: {},
}
export default meta

const getTitreCommunesAction = action('getTitreCommunes')
const apiClient: Pick<TitreApiClient, 'getTitreCommunes'> = {
  getTitreCommunes: titreId => {
    getTitreCommunesAction(titreId)
    if (titreId === 'pasDeCommunes') {
      return Promise.resolve([])
    }
    return Promise.resolve([
      { nom: 'Flée', id: toCommuneId('72000') },
      { nom: 'Montval-sur-loir', id: toCommuneId('72000') },
      { nom: 'Tours', id: toCommuneId('37000') },
      { nom: 'Ville de Guyane', id: toCommuneId('97300') },
    ])
  },
}

export const OnlyCommunes: StoryFn = () => <Territoires surface={0} forets={[]} titreId={titreIdValidator.parse('titreId')} secteursMaritimes={[]} apiClient={apiClient} />
export const OnlySurface: StoryFn = () => <Territoires surface={4} forets={[]} titreId={titreIdValidator.parse('pasDeCommunes')} secteursMaritimes={[]} apiClient={apiClient} />
export const OnlyForets: StoryFn = () => <Territoires surface={0} forets={['3PI', 'BEL']} titreId={titreIdValidator.parse('pasDeCommunes')} secteursMaritimes={[]} apiClient={apiClient} />
export const OnlySdomZones: StoryFn = () => (
  <Territoires surface={0} forets={[]} titreId={titreIdValidator.parse('pasDeCommunes')} secteursMaritimes={[]} sdomZones={['1', '2']} apiClient={apiClient} />
)
export const OnlySecteursMaritimes: StoryFn = () => (
  <Territoires surface={0} forets={[]} titreId={titreIdValidator.parse('pasDeCommunes')} secteursMaritimes={['Balagne', 'Bretagne nord', 'Bretagne sud']} sdomZones={[]} apiClient={apiClient} />
)
export const All: StoryFn = () => (
  <Territoires
    surface={4}
    forets={['BEL', 'AMO']}
    secteursMaritimes={['Balagne', 'Bretagne nord', 'Bretagne sud']}
    sdomZones={['1', '0']}
    titreId={titreIdValidator.parse('titreId')}
    apiClient={apiClient}
  />
)

export const Empty: StoryFn = () => <Territoires apiClient={apiClient} forets={[]} titreId={titreIdValidator.parse('pasDeCommunes')} secteursMaritimes={[]} />
export const Loading: StoryFn = () => (
  <Territoires apiClient={{ getTitreCommunes: () => new Promise(() => ({})) }} forets={['BEL', 'AMO']} titreId={titreIdValidator.parse('titreId')} secteursMaritimes={[]} />
)
export const WithError: StoryFn = () => (
  <Territoires
    apiClient={{ getTitreCommunes: () => Promise.reject(new Error('Chargement impossible des communes')) }}
    forets={['BEL', 'AMO']}
    titreId={titreIdValidator.parse('titreId')}
    secteursMaritimes={[]}
  />
)
