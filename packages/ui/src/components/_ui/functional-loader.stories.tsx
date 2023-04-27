import { LoadingElement } from './functional-loader'
import { Meta, StoryFn } from '@storybook/vue3'
import { AsyncData } from '@/api/client-rest'

const meta: Meta = {
  title: 'Components/UI/FunctionalLoader',
  // @ts-ignore il a besoin d'un FunctionalComponent mais on peut pas le rendre générique
  component: LoadingElement,
}
export default meta

const loading: AsyncData<null> = { status: 'LOADING' }
const loaded: AsyncData<string> = { status: 'LOADED', value: 'chargé' }
const error: AsyncData<string> = { status: 'ERROR', message: 'Erreur' }

export const All: StoryFn = args => (
  <div>
    <LoadingElement data={loading} renderItem={() => null} />
    <LoadingElement data={loaded} renderItem={item => <>La valeur de l’item est : {item}</>} />
    <LoadingElement data={error} renderItem={() => null} />
  </div>
)
