import { Meta, StoryFn } from '@storybook/vue3'
import { action } from '@storybook/addon-actions'
import { Tabs, Tab } from './tabs'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'

const meta: Meta = {
  title: 'Components/UI/Tabs',
  // @ts-ignore @storybook/vue3 n'aime pas les composants tsx génériques
  component: Tabs,
}
export default meta

const update = action('update')

const tabs = [
  {
    title: 'titreTab 1',
    id: 'tabId1',
    renderContent: () => <h1>Content of tab 1</h1>,
    icon: 'fr-icon-tiktok-fill',
  },
  {
    title: 'titreTab 2',
    id: 'tabId2',
    renderContent: () => <h2>Content of tab 2</h2>,
    icon: 'fr-icon-earth-fill',
  },
] as const satisfies Readonly<NonEmptyArray<Tab<string>>>
export const Simple: StoryFn = () => <Tabs initTab={tabs[0].id} tabs={tabs} tabsTitle="Titre d’accessibilité des onglets" tabClicked={update} />
export const SecondTabInit: StoryFn = () => <Tabs initTab={tabs[1].id} tabs={tabs} tabsTitle="Titre d’accessibilité des onglets" tabClicked={update} />
