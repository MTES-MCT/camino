import { defineComponent, computed, onMounted, inject } from 'vue'
import { Icon } from '@/components/_ui/icon'
import { Router, useRouter } from 'vue-router'
import { TitresTypesIds } from 'camino-common/src/static/titresTypes'
import { canCreateTitre } from 'camino-common/src/permissions/titres'
import { useStore } from 'vuex'
import { User } from 'camino-common/src/roles'
import Filtres from './titres/filtres.vue'
import { Downloads } from './_common/downloads'
import { CaminoTitresMap } from './titres/map'
import { TablePagination } from './titres/table-pagination'
import { CaminoRestRoutes } from 'camino-common/src/rest'

function DemandeTitreButton(user: User, router: Router) {
  if (TitresTypesIds.some(titreTypeId => canCreateTitre(user, titreTypeId))) {
    return (
      <button class="btn btn-primary small flex" onClick={() => router.push({ name: 'titre-creation' })}>
        <span class="mt-xxs">Demander un titre…</span>
        <Icon name="plus" size="M" class="flex-right" color="white" />
      </button>
    )
  }
  return null
}

const vues = [
  { id: 'carte', icon: 'globe' },
  { id: 'table', icon: 'list' },
] as const

type VueId = (typeof vues)[number]['id']

function AfficheData(initialized: boolean, vueId: VueId, titres: any, total: number): JSX.Element {
  if (initialized) {
    switch (vueId) {
      case 'carte':
        return <CaminoTitresMap titres={titres} />
      case 'table':
        return <TablePagination titres={titres} total={total} />
    }
  } else {
    return <div class="table-view mb-xxl mt">…</div>
  }
}

export const Titres = defineComponent({
  setup() {
    const router = useRouter()
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

    const vueId = computed<VueId>(() => store.state.titres.vueId)
    const resultat = computed<string>(() => {
      const res = total.value > titres.value.length ? `${titres.value.length} / ${total.value}` : titres.value.length

      return `${res} résultat${titres.value.length > 1 ? 's' : ''}`
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

    return () => (
      <div>
        <div class="desktop-blobs">
          <div class="desktop-blob-2-3">
            <h1 class="mt-xs mb-m">Titres miniers et autorisations</h1>
          </div>

          <div class="desktop-blob-1-3">{DemandeTitreButton(user.value, router)}</div>
        </div>

        <Filtres initialized={initialized.value} />
        <div class="tablet-blobs tablet-flex-direction-reverse">
          <div class="tablet-blob-1-3 flex mb-s">
            {titres.value.length > 0 ? <Downloads formats={['geojson', 'csv', 'xlsx', 'ods']} downloadRoute={CaminoRestRoutes.downloadTitres} params={{}} class="flex-right full-x downloads" /> : null}
          </div>

          <div class="tablet-blob-2-3 flex">
            {vues.map(vue => {
              return (
                <div key={vue.id} class={vueId.value === vue.id ? 'active mr-xs' : 'mr-xs'}>
                  <button class="p-m btn-tab rnd-t-s" style={vueId.value === vue.id ? { cursor: 'default' } : {}} onClick={() => vueId.value !== vue.id && vueClick(vue.id)}>
                    <Icon name={vue.icon} size="M" />
                  </button>
                </div>
              )
            })}
            <div class="pl-m pt-m h5 bold">{resultat.value}</div>
          </div>
        </div>
        <div class="line-neutral width-full" />
        {AfficheData(initialized.value, vueId.value, titres.value, total.value)}
      </div>
    )
  },
})
