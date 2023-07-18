import { defineComponent, computed, ref, markRaw, Ref } from 'vue'
import { Liste, Params } from './_common/liste'
import { ADMINISTRATION_TYPES, Administrations as Adms, sortedAdministrationTypes } from 'camino-common/src/static/administrations'
import { ComponentColumnData, TableRow, TextColumnData } from './_ui/table'
import { useRoute, useRouter } from 'vue-router'
import { DsfrTag } from './_ui/tag'
import { CaminoFiltres } from './_ui/filters/camino-filtres'
import { getInitialFiltres } from './_ui/filters/filters'

const colonnes = [
  {
    id: 'abreviation',
    name: 'Abréviation',
  },
  {
    id: 'nom',
    name: 'Nom',
  },
  {
    id: 'type',
    name: 'Type',
  },
] as const

const filtres: readonly CaminoFiltres[] = ['nomsAdministration', 'administrationTypesIds'] as const
type ColonneId = (typeof colonnes)[number]['id']

const metas = {
  types: sortedAdministrationTypes,
}

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    const params = ref<Params<ColonneId>>({
      colonne: 'abreviation',
      ordre: 'asc',
      page: 1,
      // FIXME INITIAL VALUE ?
      filtres: getInitialFiltres(route, filtres),
    }) as Ref<Params<ColonneId>>

    const lignes = computed<TableRow[]>(() => {
      return [...administrations]
        .filter(a => {
          if (params.value.filtres?.nomsAdministration.length) {
            if (
              !a.id.toLowerCase().includes(params.value.filtres.nomsAdministration) &&
              !a.nom.toLowerCase().includes(params.value.filtres.nomsAdministration) &&
              !a.abreviation.toLowerCase().includes(params.value.filtres.nomsAdministration)
            ) {
              return false
            }
          }

          if (params.value.filtres?.administrationTypesIds.length) {
            if (!params.value.filtres.administrationTypesIds.includes(a.typeId)) {
              return false
            }
          }

          return true
        })
        .sort((a, b) => {
          let first: string
          let second: string
          if (params.value.colonne === 'type') {
            first = ADMINISTRATION_TYPES[a.typeId].nom
            second = ADMINISTRATION_TYPES[b.typeId].nom
          } else {
            first = a[params.value.colonne]
            second = b[params.value.colonne]
          }

          if (params.value.ordre === 'asc') {
            return first.localeCompare(second)
          }
          return second.localeCompare(first)
        })
        .map(administration => {
          const type = ADMINISTRATION_TYPES[administration.typeId]

          const columns: Record<string, ComponentColumnData | TextColumnData> = {
            abreviation: { value: administration.abreviation },
            nom: { value: administration.nom },
            type: {
              component: markRaw(DsfrTag),
              props: { ariaLabel: type.nom },
              value: type.nom,
            },
          }

          return {
            id: administration.id,
            link: { name: 'administration', params: { id: administration.id } },
            columns,
          }
        })
    })

    return () => (
      <Liste
        nom="administrations"
        listeFiltre={{ filtres, metas, initialized: true, updateUrlQuery: router }}
        colonnes={colonnes}
        lignes={lignes.value}
        total={lignes.value.length}
        route={route}
        download={null}
        renderButton={null}
        paramsUpdate={options => {
          if (params.value.filtres && options.filtres) {
            params.value.filtres.administrationTypesIds = options.filtres.administrationTypesIds
            params.value.filtres.nomsAdministration = options.filtres.nomsAdministration?.toLowerCase() ?? ''
          }
          params.value.ordre = options.ordre
          params.value.colonne = options.colonne
        }}
      />
    )
  },
})
