import { defineComponent, computed, onMounted, inject, FunctionalComponent, ref } from 'vue'
import { Icon } from '@/components/_ui/icon'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import { TitreFiltresParams, TitresFiltres, getInitialTitresFiltresParams } from './titres/filtres'
import { CaminoTitresMap, TitreCarteParams } from './titres/map'
import { TitresTablePagination, Params as TitresTablePaginationParams, getInitialTitresTablePaginationParams } from './titres/table-pagination'
import { Navigation } from './_ui/navigation'
import { Tab, newTabId, Tabs, TabId } from './_ui/tabs'
import { PageContentHeader } from './_common/page-header-content'
import { TitreForTable, titreApiClient } from './titre/titre-api-client'
import { AsyncData } from '@/api/client-rest'
import { LocationQuery, useRouter } from 'vue-router'
import { routerQueryToString } from '@/router/camino-router-link'
import { LoadingElement } from './_ui/functional-loader'
import { titresColonnes } from './titres/table-utils'
import { TitreWithPoint } from './titres/mapUtil'
import { displayPerimeterZoomMaxLevel } from './_map'

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
const carteTabId = newTabId('carte')
const tableTabId = newTabId('table')
export const Titres = defineComponent({
  setup() {
    const matomo = inject('matomo', null)
    const store = useStore()
    const router = useRouter()

    const titresMetas = ref<AsyncData<Awaited<ReturnType<typeof titreApiClient.getTitresMetas>>>>({ status: 'LOADING' })

    const data = ref<AsyncData<true>>({ status: 'LOADING' })
    const titresForTable = ref<TitreForTable[]>([])
    const titresForCarte = ref<TitreWithPoint[]>([])
    const total = ref<number>(0)

    const paramsForTable = ref<TitresTablePaginationParams>(getInitialTitresTablePaginationParams(router.currentRoute.value))
    const paramsForCarte = ref<TitreCarteParams | null>(null)
    const paramsFiltres = ref<TitreFiltresParams>(getInitialTitresFiltresParams(router.currentRoute.value))

    const reloadTitres = async (vueId: TabId) => {
      if (vueId === tableTabId) {
        await loadTitresForTable()
      } else {
        if (paramsForCarte.value !== null) {
          await loadTitresForCarte()
        }
      }
    }
    const loadTitresForTable = async () => {
      data.value = { status: 'LOADING' }
      try {
        const titres = await titreApiClient.getTitresForTable({ ...paramsForTable.value, ...paramsFiltres.value })
        titresForTable.value.splice(0, titresForTable.value.length, ...titres.elements)
        total.value = titres.total
        data.value = { status: 'LOADED', value: true }
      } catch (e: any) {
        console.error('error', e)
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
          titresForCarte.value = titres.elements
          total.value = titres.total
        } else {
          const titres = await titreApiClient.getTitresForCarte({ ...paramsFiltres.value, ...paramsForCarte.value })
          titresForCarte.value = titres.elements
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
      titresMetas.value = { status: 'LOADING' }
      try {
        const entreprises = await titreApiClient.getTitresMetas()
        titresMetas.value = { status: 'LOADED', value: entreprises }
      } catch (e: any) {
        console.error('error', e)
        titresMetas.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
      await reloadTitres(routerQueryToString(router.currentRoute.value.query.vueId, 'carte') as VueId)
    })

    const user = computed<User>(() => store.state.user.element)

    const tabId = computed<TabId>(() => routerQueryToString(router.currentRoute.value.query.vueId, carteTabId) as TabId)
    const resultat = computed<string>(() => {
      let totalLoaded = 0
      if (tabId.value === tableTabId) {
        totalLoaded = titresForTable.value.length
      } else {
        totalLoaded = titresForCarte.value.length
      }
      const res = total.value > totalLoaded ? `${totalLoaded} / ${total.value}` : totalLoaded

      return `(${res} résultat${totalLoaded > 1 ? 's' : ''})`
    })

    const vues = [
      {
        id: carteTabId,
        icon: 'fr-icon-earth-fill',
        title: 'Carte',
        renderContent: () => (
          <CaminoTitresMap
            titres={titresForCarte.value}
            router={router}
            updateCarte={async params => {
              paramsForCarte.value = params
              reloadTitres(carteTabId)
            }}
          />
        ),
      },
      {
        id: tableTabId,
        icon: 'fr-icon-list-unordered',
        title: 'Tableau',
        renderContent: () => (
          <TitresTablePagination
            route={router.currentRoute.value}
            user={user.value}
            updateParams={async params => {
              paramsForTable.value = params
              await reloadTitres(tableTabId)
            }}
            titres={titresForTable.value}
            total={total.value}
          />
        ),
      },
    ] as const satisfies readonly Tab[]

    type VueId = (typeof vues)[number]['id']

    return () => (
      <div>
        <div class="dsfr">
          <PageContentHeader
            nom="Titres miniers et autorisations"
            download={titresForCarte.value.length > 0 || titresForTable.value.length > 0 ? { formats: ['geojson', 'csv', 'xlsx', 'ods'], downloadRoute: '/titres', params: {} } : null}
            renderButton={() => <DemandeTitreButton user={user.value} />}
          />
          <LoadingElement data={data.value} renderItem={() => null} />
        </div>

        <TitresFiltres
          initialized={titresMetas.value.status === 'LOADED'}
          subtitle={resultat.value}
          metas={titresMetas.value.status === 'LOADED' ? { entreprises: titresMetas.value.value } : {}}
          route={router.currentRoute.value}
          router={router}
          paramsUpdate={async params => {
            paramsFiltres.value = params
            paramsForTable.value = { page: 1, ordre: 'asc', colonne: titresColonnes[0].id }
            await reloadTitres(tabId.value)
          }}
        />

        <div class="dsfr dsfr-container">
          {titresMetas.value.status === 'LOADED' && tabId.value ? (
            <Tabs
              initTab={tabId.value}
              tabs={vues}
              tabsTitle={'Affichage des titres en vue carte ou tableau'}
              tabClicked={async newTabId => {
                if (tabId.value !== newTabId) {
                  titresForCarte.value = []
                  const query: LocationQuery = { ...router.currentRoute.value.query, vueId: newTabId }
                  if (newTabId === tableTabId) {
                    delete query.zoom
                    delete query.perimetre
                    delete query.centre
                  }
                  await router.push({ name: router.currentRoute.value.name ?? undefined, query })
                  if (newTabId === tableTabId) {
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
