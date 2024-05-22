import { defineComponent } from 'vue'
import { Tab, Tabs } from './_ui/tabs'
import { useRouter } from 'vue-router'
import { NonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Guyane } from './statistiques/guyane'
import { GranulatsMarins } from './statistiques/granulats-marins'
import { MinerauxMetauxMetropole } from './statistiques/mineraux-metaux-metropole'
import { Globales } from './statistiques/globales'
import { z } from 'zod'
import type { Router } from 'vue-router'

const tabIds = ['globales', 'guyane', 'granulats-marins', 'mineraux-metaux-metropole'] as const
const tabIdValidator = z.enum(tabIds)
type TabId = z.infer<typeof tabIdValidator>
const tabs: NonEmptyArray<Tab<TabId>> = [
  {
    id: 'globales',
    title: 'Globales',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <Globales />,
  },
  { id: 'guyane', title: 'Guyane', icon: 'fr-icon-account-circle-fill', renderContent: () => <Guyane /> },
  {
    id: 'granulats-marins',
    title: 'Granulats marins',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <GranulatsMarins />,
  },
  {
    id: 'mineraux-metaux-metropole',
    title: 'Mineraux & métaux Hexagone',
    icon: 'fr-icon-account-circle-fill',
    renderContent: () => <MinerauxMetauxMetropole />,
  },
]

const routerReplaceTabId = (newTabId: TabId, router: Router) => {
  const routeName = router.currentRoute.value.name
  if (isNotNullNorUndefined(routeName)) {
    router.replace({ name: routeName, params: { tabId: newTabId } })
  }
}

export const Statistiques = defineComponent(() => {
  const router = useRouter()

  const initTabIdParsed = tabIdValidator.safeParse(router.currentRoute.value.params.tabId)
  const initTab: TabId = initTabIdParsed.success ? initTabIdParsed.data : 'globales'
  routerReplaceTabId(initTab, router)

  return () => <Tabs tabsTitle="Statistiques" tabs={tabs} initTab={initTab} tabClicked={tabId => routerReplaceTabId(tabId, router)} />
})
