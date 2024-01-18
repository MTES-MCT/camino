import { defineComponent, HTMLAttributes, defineAsyncComponent, computed, ref, watch } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { TitreSlug } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { DsfrLink } from '../_ui/dsfr-button'
import { contentTypes } from 'camino-common/src/rest'
import { indexToLetter } from 'camino-common/src/number'
import { AsyncData } from '../../api/client-rest'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { GeoSysteme, GeoSystemes, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { ApiClient } from '../../api/api-client'
import { capitalize } from 'camino-common/src/strings'
export type TabId = 'carte' | 'points'
interface Props {
  geojsonMultiPolygon: FeatureMultiPolygon
  apiClient: Pick<ApiClient, 'getTitresWithPerimetreForCarte' | 'getGeojsonByGeoSystemId'>
  calculateNeighbours: boolean
  titreSlug: TitreSlug
  router: Pick<Router, 'push'>
  initTab?: TabId
  class?: HTMLAttributes['class']
}

const maxRows = 20

/**
 * Attention, lors de l'import de ce composant, réfléchir si il faut l'importer en async ou pas pour ne pas l'embarquer dans le bundle principal
 *
 */
export const DsfrPerimetre = defineComponent<Props>((props: Props) => {
  const vues = [
    {
      id: 'carte',
      icon: 'fr-icon-earth-fill',
      title: 'Carte',
      renderContent: () => <TabCaminoMap {...props} />,
    },
    {
      id: 'points',
      icon: 'fr-icon-list-unordered',
      title: 'Tableau',
      renderContent: () => <TabCaminoTable geojsonMultiPolygon={props.geojsonMultiPolygon} titreSlug={props.titreSlug} apiClient={props.apiClient} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

// FIXME changer le nom des colonnes en fonction de l'unité
const columns: Column<string>[] = [
  { id: 'polygone', name: 'Polygone', noSort: true },
  { id: 'nom', name: 'Point', sort: () => -1, noSort: true },
  { id: 'latitude', name: 'Latitude', noSort: true },
  { id: 'longitude', name: 'Longitude', noSort: true },
]

const geoJsonToArray = (geojsonMultiPolygon: FeatureMultiPolygon): TableRow<string>[] => {
  let index = 0

  const rows: TableRow<string>[] = []
  geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
    topLevel.forEach((secondLevel, secondLevelIndex) =>
      secondLevel.forEach(([y, x], currentLevelIndex) => {
        // On ne rajoute pas le dernier point qui est égal au premier du contour...
        if (geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
          rows.push({
            id: `${index}`,
            link: null,
            columns: {
              polygone: { value: `Polygone ${topLevelIndex + 1}${secondLevelIndex > 0 ? ` - Lacune ${secondLevelIndex}` : ''}` },
              nom: { value: indexToLetter(index) },
              latitude: { value: `${x}` },
              longitude: { value: `${y}` },
            },
          })
          index++
        }
      })
    )
  )

  return rows
}
const TabCaminoTable = defineComponent<Pick<Props, 'geojsonMultiPolygon' | 'titreSlug' | 'apiClient'>>(props => {
  const currentRows = ref<AsyncData<TableRow<string>[]>>({ status: 'LOADING' })

  watch(
    () => props.geojsonMultiPolygon,
    () => {
      currentRows.value = { status: 'LOADED', value: geoJsonToArray(props.geojsonMultiPolygon) }
    },
    { immediate: true }
  )

  const csvContent = computed(() => {
    if (currentRows.value.status === 'LOADED') {
      return encodeURI(
        `${columns.map(c => c.name).join(';')}\n${currentRows.value.value
          .map(({ columns }) => `${columns.polygone.value};${columns.nom.value};${columns.latitude.value};${columns.longitude.value}`)
          .join('\n')}`
      )
    }

    return ''
  })

  const rowsToDisplay = computed(() => {
    if (currentRows.value.status === 'LOADED') {
      const rows = currentRows.value.value.slice(0, maxRows)

      if (currentRows.value.value.length > maxRows + 1) {
        rows.push({ id: '11', link: null, columns: { polygone: { value: '...' }, nom: { value: '...' }, latitude: { value: '...' }, longitude: { value: '...' } } })
      }

      return rows
    }

    return []
  })

  const geoSystemSelected = ref<GeoSysteme | undefined>(GeoSystemes[4326])
  const geoSystemUpdate = async (geoSysteme: GeoSysteme | undefined) => {
    geoSystemSelected.value = geoSysteme
    if (geoSysteme !== undefined) {
      try {
        currentRows.value = { status: 'LOADING' }

        const newGeojson = await props.apiClient.getGeojsonByGeoSystemId(props.geojsonMultiPolygon, geoSysteme.id)
        currentRows.value = { status: 'LOADED', value: geoJsonToArray(newGeojson) }
      } catch (e: any) {
        console.error('error', e)
        currentRows.value = {
          status: 'ERROR',
          message: e.message ?? "Une erreur s'est produite",
        }
      }
    }
  }

  const geoSystemeFiltered = ref<GeoSysteme[]>(transformableGeoSystemes)
  const geoSystemeOnInput = (search: string) => {
    const formatedSearch = search.trim().toLowerCase()

    if (formatedSearch.length === 0) {
      geoSystemeFiltered.value = transformableGeoSystemes
    } else {
      geoSystemeFiltered.value = transformableGeoSystemes.filter(
        ({ nom, id, zone }) =>
          id.toLowerCase().includes(formatedSearch) || nom.toLowerCase().includes(formatedSearch) || zone.toLowerCase().includes(formatedSearch) || id === geoSystemSelected.value?.id
      )
    }
  }
  const overrideItems = [GeoSystemes[4326]]

  const display = (geosystem: GeoSysteme) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }} class="fr-pl-2w">
        <span class="fr-text--bold">
          {capitalize(geosystem.nom)} - ({geosystem.id})
        </span>
        <span class="fr-text">{capitalize(geosystem.zone)}</span>
      </div>
    )
  }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TypeAheadSingle
        overrideItems={overrideItems}
        props={{
          items: geoSystemeFiltered.value,
          itemChipLabel: item => `${item.nom} - (${item.id})`,
          itemKey: 'id',
          placeholder: '',
          minInputLength: 1,
          onSelectItem: geoSystemUpdate,
          onInput: geoSystemeOnInput,
          displayItemInList: display,
        }}
      />
      <TableAuto caption="" class="fr-mb-1w" columns={columns} rows={rowsToDisplay.value} initialSort={{ colonne: 'nom', ordre: 'asc' }} />

      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.csv};charset=utf-8,${csvContent.value}`}
        download={`points-${props.titreSlug}.csv`}
        icon="fr-icon-download-line"
        buttonType="secondary"
        title="Télécharge les points au format csv"
        label=".csv"
      />
    </div>
  )
})

const TabCaminoMap = defineComponent<Props>(props => {
  const neighbours = props.calculateNeighbours ? null : { apiClient: props.apiClient, titreSlug: props.titreSlug }

  const DemarcheMap = defineAsyncComponent(async () => {
    const { DemarcheMap } = await import('../demarche/demarche-map')

    return DemarcheMap
  })

  const geojson = { type: 'FeatureCollection', properties: null, features: [props.geojsonMultiPolygon] }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DemarcheMap geojsonMultiPolygon={props.geojsonMultiPolygon} style={{ minHeight: '400px' }} class="fr-mb-1w" maxMarkers={maxRows} neighbours={neighbours} router={props.router} />
      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.geojson};charset=utf-8,${encodeURI(JSON.stringify(geojson))}`}
        download={`points-${props.titreSlug}.geojson`}
        icon="fr-icon-download-line"
        buttonType="secondary"
        title="Télécharge le périmètre au format geojson"
        label=".geojson"
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrPerimetre.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoMap.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoTable.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug']
