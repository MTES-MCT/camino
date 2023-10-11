import { Ref, defineComponent, nextTick, ref } from 'vue'

import { DsfrIcon } from './dsfrIconSpriteType'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'
import { random } from '../../utils/vue-tsx-utils'

export type Tab<TabId> = { icon: DsfrIcon; title: string; id: TabId; renderContent: () => JSX.Element }

type Props<TabId> = {
  tabsTitle: string
  tabs: Readonly<NonEmptyArray<Tab<TabId>>>
  initTab: TabId
  tabClicked: (tabId: TabId) => void
}

export const Tabs = defineComponent(<TabId,>(props: Props<TabId>) => {
  const currentTab = ref<TabId>(props.initTab) as Ref<TabId>

  const idSuffix = `${(random() * 1000).toFixed()}`

  nextTick(() => {
    props.tabs.forEach(tab => {
      const tabElement = document.getElementById(`tabpanel-${tab.id}-${idSuffix}-panel`)
      if (tabElement) {
        tabElement.addEventListener('dsfr.disclose', () => {
          currentTab.value = tab.id
          props.tabClicked(tab.id)
        })
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
