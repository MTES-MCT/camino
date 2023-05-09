import { Territoires } from './territoires'
import { Meta, StoryFn } from '@storybook/vue3'
import { DEPARTEMENT_IDS } from 'camino-common/src/static/departement'

const meta: Meta = {
  title: 'Components/Titre/Territoires',
  component: Territoires,
  argTypes: {},
}
export default meta

export const OnlySurface: StoryFn = () => <Territoires surface={4} forets={[]} communes={[]} secteursMaritimes={[]} />
export const OnlyForets: StoryFn = () => <Territoires surface={0} forets={[{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }]} communes={[]} secteursMaritimes={[]} />
export const OnlySdomZones: StoryFn = () => <Territoires surface={0} forets={[]} communes={[]} secteursMaritimes={[]} sdomZones={['1', '2']} />
export const OnlySecteursMaritimes: StoryFn = () => <Territoires surface={0} forets={[]} communes={[]} secteursMaritimes={['Balagne', 'Bretagne nord', 'Bretagne sud']} sdomZones={[]} />
export const All: StoryFn = () => (
  <Territoires
    surface={4}
    forets={[{ nom: 'Forêt 1' }, { nom: 'Forêt 2' }]}
    communes={[
      { nom: 'Flée', departementId: DEPARTEMENT_IDS.Sarthe },
      { nom: 'Montval-sur-loir', departementId: DEPARTEMENT_IDS.Sarthe },
      { nom: 'Tours', departementId: DEPARTEMENT_IDS['Indre-et-Loire'] },
      { nom: 'Ville de Guyane', departementId: DEPARTEMENT_IDS.Guyane },
    ]}
    secteursMaritimes={['Balagne', 'Bretagne nord', 'Bretagne sud']}
    sdomZones={['1', '0']}
  />
)

export const Empty: StoryFn = () => <Territoires forets={[]} communes={[]} secteursMaritimes={[]} />
