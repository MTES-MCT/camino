import { defineComponent, onMounted } from 'vue'
import { Tab, Tabs } from './_ui/tabs'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { NonEmptyArray, getEntriesHardcore } from 'camino-common/src/typescript-tools'

const tabs: NonEmptyArray<Tab<TabId>> = [
  {
    id: 'globales',
    title: 'Globales',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <RouterView />,
  },
  { id: 'guyane', title: 'Guyane', icon: 'fr-icon-account-circle-fill', renderContent: () => <RouterView /> },
  {
    id: 'granulats-marins',
    title: 'Granulats marins',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <RouterView />,
  },
  {
    id: 'mineraux-metaux-metropole',
    title: 'Mineraux & métaux Hexagone',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <RouterView />,
  },
]

const routeToTab = {
  globales: 'statistiques-globales',
  guyane: 'statistiques-guyane',
  'granulats-marins': 'statistiques-granulats-marins',
  'mineraux-metaux-metropole': 'statistiques-mineraux-metaux-metropole',
} as const
type TabId = keyof typeof routeToTab
export const Statistiques = defineComponent(() => {
  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    if (route.name === 'statistiques') {
      router.replace({ name: 'statistiques-globales' })
    }
  })
  const initTab: TabId = (getEntriesHardcore(routeToTab).find(([_myTabId, tabRoute]) => tabRoute === (route.name ?? 'statistiques-globales')) ?? ['globales'])[0]

  return () => (
    <Tabs
      tabsTitle="Statistiques"
      tabs={tabs}
      initTab={initTab}
      tabClicked={tabId => {
        router.push({ name: routeToTab[tabId] })
      }}
    />
  )
})
