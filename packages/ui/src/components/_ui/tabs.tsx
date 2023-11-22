import { Ref, defineComponent, nextTick, onBeforeUnmount, ref } from 'vue'

import { DsfrIcon } from './dsfrIconSpriteType'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { random } from '../../utils/vue-tsx-utils'

export type Tab<TabId extends string> = { icon: DsfrIcon; title: string; id: TabId; renderContent: () => JSX.Element }

type Props<TabId extends string> = {
  tabsTitle: string
  tabs: Readonly<NonEmptyArray<Tab<TabId>>>
  initTab: TabId
  tabClicked: (tabId: TabId) => void
}

export const Tabs = defineComponent(<TabId extends string>(props: Props<TabId>) => {
  const currentTab = ref<TabId>(props.initTab) as Ref<TabId>

  const events = ref<{ [key in TabId]?: () => void }>({}) as Ref<{ [key in TabId]?: () => void }>
  const idSuffix = `${(random() * 1000).toFixed()}`

  // TODO 2023-11-22 il faudrait supprimer le js du DSFR et utiliser le notre, avec la 1.10.2 on se retrouvait avec un bug sur les statistiques, tous les tabs étaient cliquées quand on unmountait le composant. Pas très future-proof
  nextTick(() => {
    props.tabs.forEach(tab => {
      const tabElement = document.getElementById(`tabpanel-${tab.id}-${idSuffix}-panel`)
      if (tabElement) {
        events.value[tab.id] = () => {
          currentTab.value = tab.id
          props.tabClicked(tab.id)
        }
        tabElement.addEventListener('dsfr.disclose', events.value[tab.id] ?? (() => {}))
      }
    })
  })

  onBeforeUnmount(() => {
    props.tabs.forEach(tab => {
      const tabElement = document.getElementById(`tabpanel-${tab.id}-${idSuffix}-panel`)
      if (tabElement) {
        tabElement.removeEventListener('dsfr.disclose', events.value[tab.id] ?? (() => {}))
      }
    })
  })

  return () => (
    <div class="dsfr">
      <div class="fr-tabs">
        <ul class="fr-tabs__list" role="tablist" aria-label={props.tabsTitle}>
          {props.tabs.map(tab => (
            <li role="presentation">
              <button
                id={`tabpanel-${tab.id}-${idSuffix}`}
                class={['fr-tabs__tab', tab.icon, 'fr-tabs__tab--icon-left']}
                tabindex={props.initTab === tab.id ? '0' : '-1'}
                role="tab"
                aria-label={tab.title}
                aria-selected={props.initTab === tab.id ? 'true' : 'false'}
                aria-controls={`tabpanel-${tab.id}-${idSuffix}-panel`}
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
        {props.tabs.map(tab => (
          <div
            id={`tabpanel-${tab.id}-${idSuffix}-panel`}
            class={['fr-tabs__panel', tab.id === props.initTab ? 'fr-tabs__panel--selected' : undefined]}
            role="tabpanel"
            aria-labelledby={`tabpanel-${tab.id}-${idSuffix}`}
            tabindex="0"
          >
            {currentTab.value === tab.id ? tab.renderContent() : null}
          </div>
        ))}
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Tabs.props = ['tabsTitle', 'tabs', 'initTab', 'tabClicked']
