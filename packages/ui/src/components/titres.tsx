import { defineComponent, computed, onMounted, inject, FunctionalComponent } from 'vue'
import { Icon } from '@/components/_ui/icon'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import Filtres from './titres/filtres.vue'
import { CaminoTitresMap } from './titres/map'
import { TitresTablePagination } from './titres/table-pagination'
import { Navigation } from './_ui/navigation'
import { Tab, newTabId, Tabs } from './_ui/tabs'
import { PageContentHeader } from './_common/page-header-content'

const DemandeTitreButton: FunctionalComponent<{ user: User }> = ({ user }) => {
  if (TitresTypesIds.some(titreTypeId => canCreateTitre(user, titreTypeId))) {
    return (
      <Navigation
        class="fr-btn fr-ml-1w"
        to="/titres/creation"
        title="Demander un nouveau titre"
        render={() => (
          <>
            <span class="mt-xxs">Demander un titre…</span>
            <Icon name="plus" size="M" class="flex-right" color="white" aria-hidden="true" />
          </>
        )}
      />
    )
  }
  return null
}

export const Titres = defineComponent({
  setup() {
    const matomo = inject('matomo', null)
    const store = useStore()
    onMounted(() => {
      store.dispatch('titres/init')
    })

    const user = computed<User>(() => store.state.user.element)
    const initialized = computed<boolean>(() => store.state.titres.initialized)
    const loading = computed<boolean>(() => store.state.loading.includes('titres'))
    const titres = computed<any[]>(() => store.state.titres.elements)
    const total = computed<number>(() => store.state.titres.total)

    const vueId = computed<VueId | null>(() => store.state.titres.vueId)
    const resultat = computed<string>(() => {
      const res = total.value > titres.value.length ? `${titres.value.length} / ${total.value}` : titres.value.length

      return `(${res} résultat${titres.value.length > 1 ? 's' : ''})`
    })

    const vueSet = async (vueId: VueId) => {
      await store.dispatch('titres/vueSet', vueId)

      if (matomo) {
        // @ts-ignore
        matomo.trackEvent('titres-vue', 'titres-vueId', vueId)
      }
    }
    const vueClick = async (vueId: VueId) => {
      if (!loading.value) {
        await vueSet(vueId)
      }
    }

    const vues = [
      { id: newTabId('carte'), icon: 'fr-icon-earth-fill', title: 'Carte', renderContent: () => <CaminoTitresMap titres={titres.value} /> },
      { id: newTabId('table'), icon: 'fr-icon-list-unordered', title: 'Tableau', renderContent: () => <TitresTablePagination titres={titres.value} total={total.value} /> },
    ] as const satisfies readonly Tab[]

    type VueId = (typeof vues)[number]['id']

    return () => (
      <div>
        <div class="dsfr">
          <PageContentHeader
            nom="Titres miniers et autorisations"
            download={titres.value.length > 0 ? { formats: ['geojson', 'csv', 'xlsx', 'ods'], downloadRoute: '/titres', params: {} } : null}
            renderButton={() => <DemandeTitreButton user={user.value} />}
          />
        </div>

        <Filtres initialized={initialized.value} subtitle={resultat.value} />

        <div class="dsfr dsfr-container">
          {initialized.value && vueId.value ? (
            <Tabs initTab={vueId.value} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={tabId => vueId.value !== tabId && vueClick(tabId)} />
          ) : null}
        </div>
      </div>
    )
  },
})
