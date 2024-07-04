import { Ref, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

import { DsfrIcon } from './dsfrIconSpriteType'
import { NonEmptyArray, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { random } from '../../utils/vue-tsx-utils'
import type { JSX } from 'vue/jsx-runtime'
export type Tab<TabId extends string> = { icon: DsfrIcon | null; title: string; id: TabId; renderContent: () => JSX.Element }

type Props<TabId extends string> = {
  tabsTitle: string
  tabs: Readonly<NonEmptyArray<Tab<TabId>>>
  initTab: TabId
  tabClicked: (tabId: TabId) => void
}

export const Tabs = defineComponent(<TabId extends string>(props: Props<TabId>) => {
  const currentTabId = ref<TabId>(props.initTab) as Ref<TabId>
  const tabsListRef = ref<HTMLElement>()

  const idSuffix = `${(random() * 1000).toFixed()}`
  const getHtmlTabId = (tabId: TabId) => `tabpanel-${tabId}-${idSuffix}-panel`

  const panelHeight = ref<number>(0)

  const observer = new ResizeObserver(entries => {
    panelHeight.value = entries[0].borderBoxSize[0].blockSize
  })

  const tabsHeight = computed<string>(() => {
    const currentTabRef = document.getElementById(getHtmlTabId(currentTabId.value))
    if (isNotNullNorUndefined(tabsListRef.value) && isNotNullNorUndefined(currentTabRef)) {
      const listHeight = Math.round(tabsListRef.value.getClientRects()[0]?.height ?? 0)

      return panelHeight.value + listHeight + 'px'
    }
    return 'auto'
  })

  const tabsIndex = props.tabs.reduce<Record<TabId, number>>((acc, tab, index) => ({ ...acc, [tab.id]: index }), {} as Record<TabId, number>)

  const observeCurrentTab = () => {
    const currentTabRef = document.getElementById(getHtmlTabId(currentTabId.value))
    if (isNotNullNorUndefined(currentTabRef)) {
      observer.observe(currentTabRef)
    }
  }
  const onTabClick = (tabId: TabId) => () => {
    observer.disconnect()
    currentTabId.value = tabId
    props.tabClicked(tabId)
    observeCurrentTab()
  }

  onMounted(() => {
    observeCurrentTab()
  })

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  return () => (
    <div>
      <div class="fr-tabs" style={{ '--tabs-height': tabsHeight.value }}>
        <ul class="fr-tabs__list" ref={tabsListRef} role="tablist" aria-label={props.tabsTitle}>
          {props.tabs.map(tab => (
            <li role="presentation">
              <button
                id={`tabpanel-${tab.id}-${idSuffix}`}
                class={['fr-tabs__tab', tab.icon, tab.icon !== null ? 'fr-tabs__tab--icon-left' : '']}
                tabindex={currentTabId.value === tab.id ? '0' : '-1'}
                role="tab"
                onClick={onTabClick(tab.id)}
                aria-label={tab.title}
                aria-selected={currentTabId.value === tab.id ? 'true' : 'false'}
                aria-controls={`tabpanel-${tab.id}-${idSuffix}-panel`}
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>
        {props.tabs.map(tab => (
          <div
            id={getHtmlTabId(tab.id)}
            class={{
              'fr-tabs__panel': true,
              'fr-tabs__panel--selected': tab.id === currentTabId.value,
              'fr-tabs__panel--direction-start': tabsIndex[tab.id] < tabsIndex[currentTabId.value],
              'fr-tabs__panel--direction-end': tabsIndex[tab.id] > tabsIndex[currentTabId.value],
            }}
            role="tabpanel"
            key={tab.id}
            aria-labelledby={`tabpanel-${tab.id}-${idSuffix}`}
            tabindex="0"
          >
            {currentTabId.value === tab.id ? tab.renderContent() : null}
          </div>
        ))}
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Tabs.props = ['tabsTitle', 'tabs', 'initTab', 'tabClicked']
