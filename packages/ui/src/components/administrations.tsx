import { defineComponent, computed, ref, markRaw } from 'vue'
import { Liste, Params } from './_common/liste'
import { ADMINISTRATION_TYPES, Administrations as Adms, AdministrationTypeId, sortedAdministrationTypes, administrationTypeIdValidator } from 'camino-common/src/static/administrations'
import { elementsFormat } from '@/utils'
import { ComponentColumnData, TableRow, TextColumnData } from './_ui/table'
import { useRoute } from 'vue-router'
import { DsfrTag } from './_ui/tag'
import { z } from 'zod'
import { FiltersDeclaration } from './_ui/all-filters'

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

const filtreIds = ['noms', 'typesIds'] as const
type FiltreId = typeof filtreIds[number]

const filtres: {[key in FiltreId]: FiltersDeclaration<key, never, never, never>} = {
  noms: {
    id: 'noms',
    type: 'input',
    value: '',
    name: 'Nom',
    placeholder: `Nom de l'administration`,
    validator: z.string(),
  },
  typesIds: {
    id: 'typesIds',
    name: 'Types',
    type: 'checkboxes',
    value: [],
    elements: Object.values(ADMINISTRATION_TYPES),
    component: 'FiltresLabel',
    validator: z.array(administrationTypeIdValidator),
  },
}
type ColonneId = (typeof colonnes)[number]['id']

const metas = {
  types: sortedAdministrationTypes,
}

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const params = ref<Params<ColonneId, FiltreId, typeof filtres>>({
      colonne: 'abreviation',
      ordre: 'asc',
      page: 1,
      // FIXME INITIAL VALUE ?
      filtres: {
        noms: '',
        typesIds: [],
      },
    })

    const route = useRoute()

    const lignes = computed<TableRow[]>(() => {
      return [...administrations]
        .filter(a => {
          if (params.value.filtres.noms.length) {
            if (
              !a.id.toLowerCase().includes(params.value.filtres.noms) &&
              !a.nom.toLowerCase().includes(params.value.filtres.noms) &&
              !a.abreviation.toLowerCase().includes(params.value.filtres.noms)
            ) {
              return false
            }
          }

          if (params.value.filtres.typesIds.length) {
            if (!params.value.filtres.typesIds.includes(a.typeId)) {
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
        listeFiltre={{ filtres, metas, initialized: true, filtresParam: params.value.filtres }}
        colonnes={colonnes}
        lignes={lignes.value}
        total={lignes.value.length}
        route={route}
        download={null}
        renderButton={null}
        paramsUpdate={options => {
          params.value.filtres.typesIds = options.filtres.typesIds
          params.value.filtres.noms = options.filtres.noms?.toLowerCase() ?? ''
          params.value.ordre = options.ordre
          params.value.colonne = options.colonne
        }}
      />
    )
  },
})
