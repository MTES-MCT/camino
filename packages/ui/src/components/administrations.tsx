import { defineComponent, computed, ref, markRaw } from 'vue'
import Liste from './_common/liste.vue'
import {
  ADMINISTRATION_TYPES,
  Administrations as Adms,
  AdministrationTypeId,
  sortedAdministrationTypes
} from 'camino-common/src/static/administrations'
import { elementsFormat } from '@/utils'
import { Tag } from '@/components/_ui/tag'
import { ComponentColumnData, TableRow, TextColumnData } from './_ui/newTable'

const colonnes = [
  {
    id: 'abreviation',
    name: 'Abréviation'
  },
  {
    id: 'nom',
    name: 'Nom'
  },
  {
    id: 'type',
    name: 'Type'
  }
] as const
const filtres = [
  {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Nom',
    placeholder: `Nom de l'administration`
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: [],
    elementsFormat
  }
]
type ColonneId = (typeof colonnes)[number]['id']

type ParamsFiltre = {
  section: 'filtres'
  params: { noms: string; typesIds: AdministrationTypeId[] }
}
type ParamsTable = {
  section: 'table'
  params: { colonne: ColonneId; ordre: 'asc' | 'desc' }
}

const isParamsFiltre = (
  options: ParamsFiltre | ParamsTable
): options is ParamsFiltre => options.section === 'filtres'

const metas = {
  types: sortedAdministrationTypes
}

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const params = ref<{
      table: { page: 0; colonne: ColonneId; ordre: 'asc' | 'desc' }
      filtres: unknown
    }>({
      table: {
        page: 0,
        colonne: 'abreviation',
        ordre: 'asc'
      },
      filtres
    })

    const listState = ref<{ noms: string; typesIds: AdministrationTypeId[] }>({
      noms: '',
      typesIds: []
    })

    const lignes = computed<TableRow[]>(() => {
      return [...administrations]
        .filter(a => {
          if (listState.value.noms.length) {
            if (
              !a.id.toLowerCase().includes(listState.value.noms) &&
              !a.nom.toLowerCase().includes(listState.value.noms) &&
              !a.abreviation.toLowerCase().includes(listState.value.noms)
            ) {
              return false
            }
          }

          if (listState.value.typesIds.length) {
            if (!listState.value.typesIds.includes(a.typeId)) {
              return false
            }
          }

          return true
        })
        .sort((a, b) => {
          let first: string
          let second: string
          if (params.value.table.colonne === 'type') {
            first = ADMINISTRATION_TYPES[a.typeId].nom
            second = ADMINISTRATION_TYPES[b.typeId].nom
          } else {
            first = a[params.value.table.colonne]
            second = b[params.value.table.colonne]
          }

          if (params.value.table.ordre === 'asc') {
            return first.localeCompare(second)
          }
          return second.localeCompare(first)
        })
        .map(administration => {
          const type = ADMINISTRATION_TYPES[administration.typeId]

          const columns: Record<string, ComponentColumnData | TextColumnData> =
            {
              abreviation: { value: administration.abreviation },
              nom: { value: administration.nom, class: ['h6'] },
              type: {
                component: markRaw(Tag),
                props: { mini: true, text: type.nom },
                class: 'mb--xs',
                value: 'unused'
              }
            }

          return {
            id: administration.id,
            link: { name: 'administration', params: { id: administration.id } },
            columns
          }
        })
    })
    const paramsUpdate = (options: ParamsFiltre | ParamsTable) => {
      if (isParamsFiltre(options)) {
        listState.value.noms = options.params.noms.toLowerCase()
        listState.value.typesIds = options.params.typesIds
      } else {
        params.value.table.ordre = options.params.ordre
        params.value.table.colonne = options.params.colonne
      }
    }
    return () => (
      <Liste
        nom="administrations"
        filtres={filtres}
        colonnes={colonnes}
        lignes={lignes.value}
        elements={lignes.value}
        params={params.value}
        metas={metas}
        total={administrations.length}
        initialized={true}
        onParamsUpdate={paramsUpdate}
      />
    )
  }
})
