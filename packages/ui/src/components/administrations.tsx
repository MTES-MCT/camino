import { defineComponent, computed, ref, markRaw } from 'vue'
import { Liste, Params } from './_common/liste'
import { ADMINISTRATION_TYPES, Administrations as Adms, AdministrationTypeId, sortedAdministrationTypes, isAdministrationTypeId } from 'camino-common/src/static/administrations'
import { elementsFormat } from '@/utils'
import { ComponentColumnData, TableRow, TextColumnData } from './_ui/table'
import { useRoute } from 'vue-router'
import { DsfrTag } from './_ui/tag'

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
const filtres = [
  {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Nom',
    placeholder: `Nom de l'administration`,
  },
  {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: [],
    elementsFormat,
  },
] as const
type ColonneId = (typeof colonnes)[number]['id']
type FiltreId = (typeof filtres)[number]['id']

const metas = {
  types: sortedAdministrationTypes,
}

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const params = ref<Params<ColonneId, FiltreId>>({
      colonne: 'abreviation',
      ordre: 'asc',
      page: 1,
      // FIXME INITIAL VALUE ?
      filtres: {
        noms: undefined,
        typesIds: [],
      },
    })

    const listState = ref<{ noms: string; typesIds: AdministrationTypeId[] }>({
      noms: '',
      typesIds: [],
    })

    const route = useRoute()

    const lignes = computed<TableRow[]>(() => {
      return [...administrations]
        .filter(a => {
          if (listState.value.noms.length) {
            if (!a.id.toLowerCase().includes(listState.value.noms) && !a.nom.toLowerCase().includes(listState.value.noms) && !a.abreviation.toLowerCase().includes(listState.value.noms)) {
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
    const paramsUpdate = (options: Params<ColonneId, FiltreId>) => {
      const typesIds = options.filtres.typesIds
      const noms = options.filtres.noms
      if (Array.isArray(typesIds)) {
        listState.value.typesIds = typesIds.filter(isAdministrationTypeId)
      }
      if (typeof noms === 'string') {
        listState.value.noms = noms.toLowerCase()
      }
      params.value.ordre = options.ordre
      params.value.colonne = options.colonne
    }
    return () => (
      <Liste
        nom="administrations"
        listeFiltre={{ filtres, metas, initialized: true, filtresParam: params.value.filtres }}
        colonnes={colonnes}
        lignes={lignes.value}
        total={lignes.value.length}
        route={route}
        download={null}
        renderButton={null}
        paramsUpdate={paramsUpdate}
      />
    )
  },
})
