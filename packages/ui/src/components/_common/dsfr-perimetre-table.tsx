import { AsyncData } from '@/api/client-rest'
import { contentTypes } from 'camino-common/src/rest'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { defineComponent, ref, watch, computed } from 'vue'
import { DsfrLink } from '../_ui/dsfr-button'
import { TableRow } from '../_ui/table'
import { TableAuto, Column } from '../_ui/table-auto'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { PerimetreApiClient } from '../titre/perimetre-api-client'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { TitreSlug } from 'camino-common/src/titres'
import { capitalize } from 'camino-common/src/strings'
import { indexToLetter, toDegresMinutes } from 'camino-common/src/number'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  geojsonMultiPolygon: FeatureMultiPolygon
  apiClient: Pick<PerimetreApiClient, 'getGeojsonByGeoSystemeId'>
  titreSlug: TitreSlug
  maxRows: number
}

const columns = (uniteId: GeoSysteme['uniteId'] | undefined): Column<string>[] => {
  if (isNotNullNorUndefined(uniteId)) {
    const alwaysPresentColumns = [
      { id: 'polygone', name: 'Polygone', noSort: true },
      { id: 'nom', name: 'Point', sort: () => -1, noSort: true },
      { id: 'x', name: capitalize(labels[uniteId].x), noSort: true },
      { id: 'y', name: capitalize(labels[uniteId].y), noSort: true },
    ]
    if (uniteId === 'deg') {
      alwaysPresentColumns.push({ id: 'x_deg', name: capitalize(labels[uniteId].x), noSort: true }, { id: 'y_deg', name: capitalize(labels[uniteId].y), noSort: true })
    }

    return alwaysPresentColumns
  }

  return []
}

const labels = {
  met: { x: 'x', y: 'y' },
  deg: { x: 'longitude (E)', y: 'latitude (N)' },
  gon: { x: 'longitude', y: 'latitude' },
} as const satisfies Record<GeoSysteme['uniteId'], { x: string; y: string }>
const geoJsonToArray = (geojsonMultiPolygon: FeatureMultiPolygon): TableRow<string>[] => {
  let index = 0

  const rows: TableRow<string>[] = []
  geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
    topLevel.forEach((secondLevel, secondLevelIndex) =>
      secondLevel.forEach(([x, y], currentLevelIndex) => {
        // On ne rajoute pas le dernier point qui est égal au premier du contour...
        if (geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
          const x_deg = toDegresMinutes(x)
          const y_deg = toDegresMinutes(y)
          rows.push({
            id: `${index}`,
            link: null,
            columns: {
              polygone: { value: `Polygone ${topLevelIndex + 1}${secondLevelIndex > 0 ? ` - Lacune ${secondLevelIndex}` : ''}` },
              nom: { value: indexToLetter(index) },
              x: { value: `${x}` },
              y: { value: `${y}` },
              x_deg: { value: `${x_deg.degres}°${Intl.NumberFormat('fr-FR').format(x_deg.minutes)}'` },
              y_deg: { value: `${y_deg.degres}°${Intl.NumberFormat('fr-FR').format(y_deg.minutes)}'` },
            },
          })
          index++
        }
      })
    )
  )

  return rows
}

export const TabCaminoTable = defineComponent<Props>(props => {
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
      const columsToSave = columns(geoSystemSelected.value?.uniteId)

      const values = currentRows.value.value.map(({ columns }) => columsToSave.map(({ id }) => columns[id].value).join(';'))

      return encodeURI(`${columsToSave.map(c => c.name).join(';')}\n${values.join('\n')}`)
    }

    return ''
  })

  const rowsToDisplay = computed(() => {
    if (currentRows.value.status === 'LOADED') {
      const rows = currentRows.value.value.slice(0, props.maxRows)

      if (currentRows.value.value.length > props.maxRows + 1) {
        rows.push({ id: '11', link: null, columns: { polygone: { value: '...' }, nom: { value: '...' }, x: { value: '...' }, y: { value: '...' }, x_deg: { value: '...' }, y_deg: { value: '...' } } })
      }

      return rows
    }

    return []
  })

  const geoSystemSelected = ref<GeoSysteme<TransformableGeoSystemeId> | undefined>(GeoSystemes[4326])
  const geoSystemUpdate = async (geoSysteme: GeoSysteme<TransformableGeoSystemeId> | undefined) => {
    geoSystemSelected.value = geoSysteme
    if (geoSysteme !== undefined) {
      try {
        currentRows.value = { status: 'LOADING' }

        const newGeojson = await props.apiClient.getGeojsonByGeoSystemeId(props.geojsonMultiPolygon, geoSysteme.id)
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

  const geoSystemeFiltered = ref<GeoSysteme<TransformableGeoSystemeId>[]>(transformableGeoSystemes)
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

  const display = (geosystem: GeoSysteme<TransformableGeoSystemeId>) => {
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
      <TableAuto caption="" class="fr-mb-1w" columns={columns(geoSystemSelected.value?.uniteId)} rows={rowsToDisplay.value} initialSort={{ colonne: 'nom', ordre: 'asc' }} />

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

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoTable.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'maxRows']
