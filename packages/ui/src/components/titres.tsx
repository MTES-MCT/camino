import { defineComponent, defineAsyncComponent, computed, onMounted, inject, FunctionalComponent, ref } from 'vue'
import { Icon } from '@/components/_ui/icon'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { TitreFiltresParams, TitresFiltres, getInitialTitresFiltresParams } from './titres/filtres'
import type { TitreCarteParams } from './titres/map'
import { Navigation } from './_ui/navigation'
import { Tab, Tabs } from './_ui/tabs'
import { PageContentHeader } from './_common/page-header-content'
import { titreApiClient } from './titre/titre-api-client'
import { AsyncData } from '@/api/client-rest'
import { LocationQuery, useRouter } from 'vue-router'
import { routerQueryToString } from '@/router/camino-router-link'
import { titresColonnes, titresLignesBuild } from './titres/table-utils'
import type { TitreWithPoint } from './titres/mapUtil'
import { displayPerimeterZoomMaxLevel } from './_map/util'
import { apiClient } from '../api/api-client'
import { TablePagination, getInitialParams } from './_ui/table-pagination'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { TableRow } from './_ui/table'
import { titresDownloadFormats } from 'camino-common/src/filters'

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

const tabs = ['carte', 'table'] as const
type TabId = (typeof tabs)[number]

type TitresTablePaginationParams = { page: number; colonne: (typeof titresColonnes)[number]['id']; ordre: 'asc' | 'desc' }
export const Titres = defineComponent({
  setup() {
    const CaminoTitresMap = defineAsyncComponent(async () => {
      const { CaminoTitresMap } = await import('./titres/map')
      return CaminoTitresMap
    })
    const matomo = inject('matomo', null)
    const store = useStore()
    const router = useRouter()

    const data = ref<AsyncData<true>>({ status: 'LOADING' })
    const titresForTable = ref<AsyncData<{ rows: TableRow[]; total: number }>>({ status: 'LOADING' })
    const titresForCarte = ref<{ hash: string; titres: TitreWithPoint[] }>({ hash: '', titres: [] })
    const total = ref<number>(0)

    const paramsForTable = ref<TitresTablePaginationParams>(getInitialParams(router.currentRoute.value, titresColonnes))
    const paramsForCarte = ref<TitreCarteParams | null>(null)
    const paramsFiltres = ref<TitreFiltresParams>(getInitialTitresFiltresParams(router.currentRoute.value))

    const reloadTitres = async (vueId: TabId) => {
      if (vueId === 'table') {
        await loadTitresForTable()
      } else {
        if (paramsForCarte.value !== null) {
          await loadTitresForCarte()
        }
      }
    }
    const loadTitresForTable = async () => {
      data.value = { status: 'LOADING' }
      titresForTable.value = { status: 'LOADING' }
      try {
        const titres = await titreApiClient.getTitresForTable({ ...paramsForTable.value, ...paramsFiltres.value })
        titresForTable.value = { status: 'LOADED', value: { total: titres.total, rows: titresLignesBuild(titres.elements, activitesCol.value) } }
        total.value = titres.total
        data.value = { status: 'LOADED', value: true }
      } catch (e: any) {
        console.error('error', e)
        titresForTable.value = { status: 'ERROR', message: e.message ?? "Une erreur s'est produite" }
        data.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }

    const loadTitresForCarte = async () => {
      data.value = { status: 'LOADING' }
      try {
        if ((paramsForCarte.value?.zoom ?? 0) > displayPerimeterZoomMaxLevel) {
          const titres = await titreApiClient.getTitresWithPerimetreForCarte({ ...paramsFiltres.value, ...paramsForCarte.value })
          titresForCarte.value = { hash: JSON.stringify(paramsFiltres.value), titres: titres.elements }
          total.value = titres.total
        } else {
          const titres = await titreApiClient.getTitresForCarte({ ...paramsFiltres.value, ...paramsForCarte.value })
          titresForCarte.value = { hash: JSON.stringify(paramsFiltres.value), titres: titres.elements }
          total.value = titres.total
        }
        data.value = { status: 'LOADED', value: true }
      } catch (e: any) {
        console.error('error', e)
        data.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
    onMounted(async () => {
      await reloadTitres(routerQueryToString(router.currentRoute.value.query.vueId, 'carte') as VueId)
    })

    const user = computed<User>(() => store.state.user.element)

    const tabId = computed<TabId>(() => routerQueryToString(router.currentRoute.value.query.vueId, 'carte') as TabId)
    const resultat = computed<string>(() => {
      let totalLoaded = 0
      if (tabId.value === 'table') {
        if (titresForTable.value.status !== 'LOADED') {
          return '...'
        }
        totalLoaded = titresForTable.value.value.rows.length
      } else {
        totalLoaded = titresForCarte.value.titres.length
      }
      const res = total.value > totalLoaded ? `${totalLoaded} / ${total.value}` : totalLoaded

      return `(${res} résultat${totalLoaded > 1 ? 's' : ''})`
    })

    const activitesCol = computed(() => {
      return canReadActivites(user.value)
    })

    const colonnes = computed(() => {
      return titresColonnes.filter(({ id }) => (activitesCol.value ? true : id !== 'activites'))
    })

    const vues = [
      {
        id: 'carte',
        icon: 'fr-icon-earth-fill',
        title: 'Carte',
        renderContent: () => (
          <CaminoTitresMap
            titres={titresForCarte.value}
            loading={data.value.status === 'LOADING'}
            router={router}
            updateCarte={async params => {
              paramsForCarte.value = params
              reloadTitres('carte')
            }}
          />
        ),
      },
      {
        id: 'table',
        icon: 'fr-icon-list-unordered',
        title: 'Tableau',
        renderContent: () => (
          <TablePagination
            route={router.currentRoute.value}
            columns={colonnes.value}
            data={titresForTable.value}
            updateParams={async params => {
              paramsForTable.value = params
              await reloadTitres('table')
            }}
            caption="Tableau des titres"
          />
        ),
      },
    ] as const satisfies readonly Tab<TabId>[]

    type VueId = (typeof vues)[number]['id']

    return () => (
      <div>
        <div class="dsfr">
          <PageContentHeader
            nom="Titres miniers et autorisations"
            download={
              titresForCarte.value.titres.length > 0 || (titresForTable.value.status === 'LOADED' && titresForTable.value.value.rows.length > 0)
                ? { formats: titresDownloadFormats, downloadRoute: '/titres', params: {} }
                : null
            }
            renderButton={() => <DemandeTitreButton user={user.value} />}
          />
        </div>

        <TitresFiltres
          subtitle={resultat.value}
          apiClient={apiClient}
          route={router.currentRoute.value}
          router={router}
          paramsUpdate={async params => {
            paramsFiltres.value = params
            paramsForTable.value = { page: 1, ordre: 'asc', colonne: titresColonnes[0].id }
            await reloadTitres(tabId.value)
          }}
        />

        <div class="dsfr dsfr-container">
          {tabId.value ? (
            <Tabs
              initTab={tabId.value}
              tabs={vues}
              tabsTitle={'Affichage des titres en vue carte ou tableau'}
              tabClicked={async newTabId => {
                if (tabId.value !== newTabId) {
                  titresForCarte.value = { hash: '', titres: [] }
                  const query: LocationQuery = { ...router.currentRoute.value.query, vueId: newTabId }
                  if (newTabId === 'table') {
                    delete query.zoom
                    delete query.perimetre
                    delete query.centre
                  }
                  await router.push({ name: router.currentRoute.value.name ?? undefined, query })
                  if (newTabId === 'table') {
                    paramsForCarte.value = null
                    reloadTitres(newTabId)
                  }
                  if (matomo) {
                    // @ts-ignore
                    matomo.trackEvent('titres-vue', 'titres-vueId', tabId)
                  }
                }
              }}
            />
          ) : null}
        </div>
      </div>
    )
  },
})
