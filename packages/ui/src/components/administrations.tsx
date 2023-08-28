import { defineComponent, markRaw } from 'vue'
import { Liste, Params } from './_common/liste'
import { ADMINISTRATION_TYPES, Administrations as Adms } from 'camino-common/src/static/administrations'
import { Column, ComponentColumnData, TableRow, TextColumnData } from './_ui/table'
import { useRoute, useRouter } from 'vue-router'
import { DsfrTag } from './_ui/tag'
import { CaminoFiltre } from 'camino-common/src/filters'
import { apiClient } from '../api/api-client'

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
] as const satisfies readonly Column[]

const filtres: readonly CaminoFiltre[] = ['nomsAdministration', 'administrationTypesIds'] as const
type ColonneId = (typeof colonnes)[number]['id']

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    const getData = (options: Params<ColonneId>): Promise<{ total: number; values: TableRow<string>[] }> => {
      const lignes = [...administrations]
        .filter(a => {
          if (options.filtres?.nomsAdministration?.length) {
            if (
              !a.id.toLowerCase().includes(options.filtres.nomsAdministration) &&
              !a.nom.toLowerCase().includes(options.filtres.nomsAdministration) &&
              !a.abreviation.toLowerCase().includes(options.filtres.nomsAdministration)
            ) {
              return false
            }
          }

          if (options.filtres?.administrationTypesIds.length) {
            if (!options.filtres.administrationTypesIds.includes(a.typeId)) {
              return false
            }
          }

          return true
        })
        .sort((a, b) => {
          let first: string
          let second: string
          if (options.colonne === 'type') {
            first = ADMINISTRATION_TYPES[a.typeId].nom
            second = ADMINISTRATION_TYPES[b.typeId].nom
          } else {
            first = a[options.colonne]
            second = b[options.colonne]
          }

          if (options.ordre === 'asc') {
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

      return Promise.resolve({ total: lignes.length, values: lignes })
    }

    return () => <Liste nom="administrations" listeFiltre={{ filtres, apiClient, updateUrlQuery: router }} colonnes={colonnes} getData={getData} route={route} download={null} renderButton={null} />
  },
})
