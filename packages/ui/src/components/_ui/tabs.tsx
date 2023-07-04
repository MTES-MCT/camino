import { nextTick, ref } from 'vue'

import { DsfrIcon } from './dsfrIconSpriteType'
import { caminoDefineComponent } from '../../utils/vue-tsx-utils'
import { NonEmptyArray } from 'camino-common/src/typescript-tools'

export type Tab = { icon: DsfrIcon; title: string; id: TabId; renderContent: () => JSX.Element }

type TabId = string & { __camino: 'TabId' }
export const newTabId = (tabId: string): TabId => tabId as TabId
type Props = {
  tabsTitle: string
  tabs: Readonly<NonEmptyArray<Tab>>
  initTab: TabId
  tabClicked: (tabId: TabId) => void
}

export const Tabs = caminoDefineComponent<Props>(['tabsTitle', 'tabs', 'initTab', 'tabClicked'], props => {
  const currentTab = ref<TabId>(props.initTab)

  nextTick(() => {
    props.tabs.forEach(tab => {
      const tabElement = document.getElementById(`tabpanel-${tab.id}-panel`)
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
                id={`tabpanel-${tab.id}`}
                class={['fr-tabs__tab', tab.icon, 'fr-tabs__tab--icon-left']}
                tabindex={props.initTab === tab.id ? '0' : '-1'}
                role="tab"
                aria-label={tab.title}
                aria-selected={props.initTab === tab.id ? 'true' : 'false'}
                aria-controls={`tabpanel-${tab.id}-panel`}
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
        {props.tabs.map(tab => (
          <div
            id={`tabpanel-${tab.id}-panel`}
            class={['fr-tabs__panel', tab.id === props.initTab ? 'fr-tabs__panel--selected' : undefined]}
            role="tabpanel"
            aria-labelledby={`tabpanel-${tab.id}`}
            tabindex="0"
          >
            {currentTab.value === tab.id ? tab.renderContent() : null}
          </div>
        ))}
      </div>
    </div>
  )
})
