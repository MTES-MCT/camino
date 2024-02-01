import { AsyncData } from '@/api/client-rest'
import { contentTypes } from 'camino-common/src/rest'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId, transformableGeoSystemes } from 'camino-common/src/static/geoSystemes'
import { defineComponent, ref, watch, computed } from 'vue'
import { DsfrLink } from '../_ui/dsfr-button'
import { TableRow, TextColumnData } from '../_ui/table'
import { TableAuto, Column } from '../_ui/table-auto'
import { TypeAheadSingle } from '../_ui/typeahead-single'
import { PerimetreApiClient } from '../titre/perimetre-api-client'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { capitalize } from 'camino-common/src/strings'
import { indexToLetter, toDegresMinutes } from 'camino-common/src/number'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  perimetre: {
    geojson4326_perimetre: FeatureMultiPolygon
    geojson4326_points: FeatureCollectionPoints
  }
  apiClient: Pick<PerimetreApiClient, 'getGeojsonByGeoSystemeId'>
  titreSlug: TitreSlug
  maxRows: number
}

const labels = {
  met: { x: 'x', y: 'y' },
  deg: { x: 'longitude (E)', y: 'latitude (N)' },
  gon: { x: 'longitude', y: 'latitude' },
} as const satisfies Record<GeoSysteme['uniteId'], { x: string; y: string }>
const geoJsonToArray = (perimetre: Props['perimetre']): TableRow<string>[] => {
  return perimetre.geojson4326_points.features.map<TableRow<string>>((feature, index) => {
    const x_deg = toDegresMinutes(feature.geometry.coordinates[0])
    const y_deg = toDegresMinutes(feature.geometry.coordinates[1])

    return {
      id: `${index}`,
      link: null,
      columns: {
        description: { value: feature.properties.description ?? '' },
        nom: { value: feature.properties.nom ?? '' },
        x: { value: `${feature.geometry.coordinates[0]}` },
        y: { value: `${feature.geometry.coordinates[1]}` },
        x_deg: { value: `${x_deg.degres}°${Intl.NumberFormat('fr-FR').format(x_deg.minutes)}'` },
        y_deg: { value: `${y_deg.degres}°${Intl.NumberFormat('fr-FR').format(y_deg.minutes)}'` },
      },
    }
  })
}

export const TabCaminoTable = defineComponent<Props>(props => {
  const currentRows = ref<AsyncData<TableRow<string>[]>>({ status: 'LOADING' })

  watch(
    () => props.perimetre,
    () => {
      currentRows.value = { status: 'LOADED', value: geoJsonToArray(props.perimetre) }
    },
    { immediate: true }
  )

  const columns = computed(() => {
    const uniteId = geoSystemSelected.value?.uniteId

    if (isNotNullNorUndefined(uniteId)) {
      const alwaysPresentColumns: Column<string>[] = [
        { id: 'nom', name: 'Point', noSort: true },
        { id: 'description', name: 'Description', noSort: true },
        { id: 'x', name: capitalize(labels[uniteId].x), noSort: true },
        { id: 'y', name: capitalize(labels[uniteId].y), noSort: true },
      ]

      if (uniteId === 'deg') {
        alwaysPresentColumns.push({ id: 'x_deg', name: capitalize(labels[uniteId].x), noSort: true }, { id: 'y_deg', name: capitalize(labels[uniteId].y), noSort: true })
      }

      return alwaysPresentColumns
    }

    return []
  })
  const csvContent = computed(() => {
    if (currentRows.value.status === 'LOADED') {
      const columsToSave = columns.value

      const values = currentRows.value.value.map(({ columns }) => columsToSave.map(({ id }) => columns[id]?.value ?? '').join(';'))

      return encodeURI(`${columsToSave.map(c => c.name).join(';')}\n${values.join('\n')}`)
    }

    return ''
  })

  const rowsToDisplay = computed(() => {
    if (currentRows.value.status === 'LOADED') {
      const rows = currentRows.value.value.slice(0, props.maxRows)

      if (currentRows.value.value.length > props.maxRows + 1) {
        rows.push({
          id: `${props.maxRows + 1}`,
          link: null,
          columns: columns.value.reduce<Record<string, TextColumnData>>((acc, { id }) => {
            acc[id] = { value: '...' }

            return acc
          }, {}),
        })
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

        const newGeojson = await props.apiClient.getGeojsonByGeoSystemeId(props.perimetre.geojson4326_perimetre, geoSysteme.id)
        // TODO 2024-01-29 on perd les points qu'on a mis à la main
        currentRows.value = { status: 'LOADED', value: geoJsonToArray({ geojson4326_perimetre: newGeojson, geojson4326_points: transformMultipolygonToPoints(newGeojson) }) }
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
      <TableAuto caption="" class="fr-mb-1w" columns={columns.value} rows={rowsToDisplay.value} initialSort='noSort' />

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
TabCaminoTable.props = ['perimetre', 'apiClient', 'titreSlug', 'maxRows']

export const transformMultipolygonToPoints = (geojson4326_perimetre: FeatureMultiPolygon): FeatureCollectionPoints => {
  const currentPoints: (FeatureCollectionPoints['features'][0] & { properties: { latitude: string; longitude: string } })[] = []
  let index = 0
  geojson4326_perimetre.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
    topLevel.forEach((secondLevel, secondLevelIndex) =>
      secondLevel.forEach(([x, y], currentLevelIndex) => {
        // On ne rajoute pas le dernier point qui est égal au premier du contour...
        if (geojson4326_perimetre.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
          currentPoints.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [x, y],
            },
            properties: {
              nom: `${indexToLetter(index)}`,
              description: `Polygone ${topLevelIndex + 1}${secondLevelIndex > 0 ? ` - Lacune ${secondLevelIndex}` : ''}`,
              latitude: `${y}`,
              longitude: `${x}`,
            },
          })
          index++
        }
      })
    )
  )

  return {
    type: 'FeatureCollection',
    features: currentPoints,
  }
}
