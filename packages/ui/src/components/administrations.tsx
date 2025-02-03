import { defineComponent } from 'vue'
import { Liste, Params } from './_common/liste'
import { ADMINISTRATION_TYPES, Administrations as Adms } from 'camino-common/src/static/administrations'
import { Column, ComponentColumnData, JSXElementColumnData, TableRow, TextColumnData } from './_ui/table'
import { useRoute, useRouter } from 'vue-router'
import { DsfrTag } from './_ui/tag'
import { apiClient } from '../api/api-client'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { routesDefinitions } from '@/router/routes'

const colonnes = [
  {
    id: 'abreviation',
    contentTitle: 'Abréviation',
  },
  {
    id: 'nom',
    contentTitle: 'Nom',
  },
  {
    id: 'type',
    contentTitle: 'Type',
  },
] as const satisfies readonly Column[]

type ColonneId = (typeof colonnes)[number]['id']

const administrations = Object.values(Adms)

export const Administrations = defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    const getData = (options: Params<ColonneId>): Promise<{ total: number; values: TableRow<string>[] }> => {
      const lignes = [...administrations]
        .filter(a => {
          if (isNotNullNorUndefined(options.filtres) && isNotNullNorUndefined(options.filtres.nomsAdministration) && options.filtres.nomsAdministration !== '') {
            if (
              !a.id.toLowerCase().includes(options.filtres.nomsAdministration) &&
              !a.nom.toLowerCase().includes(options.filtres.nomsAdministration) &&
              !a.abreviation.toLowerCase().includes(options.filtres.nomsAdministration)
            ) {
              return false
            }
          }

          if (isNotNullNorUndefined(options.filtres) && isNotNullNorUndefinedNorEmpty(options.filtres.administrationTypesIds)) {
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

          const columns: Record<string, JSXElementColumnData | ComponentColumnData | TextColumnData> = {
            abreviation: { type: 'text', value: administration.abreviation },
            nom: { type: 'text', value: administration.nom },
            type: {
              type: 'jsx',
              jsxElement: <DsfrTag ariaLabel={type.nom} />,
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

    return () => (
      <Liste
        nom="administrations"
        listeFiltre={{ filtres: routesDefinitions.administrations.meta.filtres, apiClient, updateUrlQuery: router, entreprises: [] }}
        colonnes={colonnes}
        getData={getData}
        route={route}
        download={null}
        renderButton={null}
      />
    )
  },
})
