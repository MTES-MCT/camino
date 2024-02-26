import { AsyncData } from '@/api/client-rest'
import { contentTypes } from 'camino-common/src/rest'
import { GeoSysteme, GeoSystemes, TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { defineComponent, ref, watch, computed } from 'vue'
import { DsfrLink } from '../_ui/dsfr-button'
import { TableRow, TextColumnData } from '../_ui/table'
import { TableAuto, Column } from '../_ui/table-auto'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { capitalize } from 'camino-common/src/strings'
import { indexToLetter, toDegresMinutes } from 'camino-common/src/number'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { GeoSystemeTypeahead } from './geosysteme-typeahead'

interface Props {
  geojson_origine_points: FeatureCollectionPoints
  geo_systeme_id: TransformableGeoSystemeId
  titreSlug: TitreSlug
  maxRows: number
}

const labels = {
  met: { x: 'x', y: 'y' },
  deg: { x: 'longitude (E)', y: 'latitude (N)' },
  gon: { x: 'longitude', y: 'latitude' },
} as const satisfies Record<GeoSysteme['uniteId'], { x: string; y: string }>
const geoJsonToArray = (perimetre: FeatureCollectionPoints): TableRow<string>[] => {
  return perimetre.features.map<TableRow<string>>((feature, index) => {
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
    () => props.geojson_origine_points,
    () => {
      currentRows.value = { status: 'LOADED', value: geoJsonToArray(props.geojson_origine_points) }
    },
    { immediate: true }
  )

  const columns = computed(() => {
    const uniteId = GeoSystemes[props.geo_systeme_id].uniteId

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


  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GeoSystemeTypeahead disabled={true} geoSystemeId={props.geo_systeme_id} />
      <TableAuto caption="" class="fr-mb-1w" columns={columns.value} rows={rowsToDisplay.value} initialSort="noSort" />

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
TabCaminoTable.props = ['geojson_origine_points', 'geo_systeme_id', 'titreSlug', 'maxRows']

export const transformMultipolygonToPoints = (geojson_perimetre: FeatureMultiPolygon): FeatureCollectionPoints => {
  const currentPoints: (FeatureCollectionPoints['features'][0] & { properties: { latitude: string; longitude: string } })[] = []
  let index = 0
  geojson_perimetre.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
    topLevel.forEach((secondLevel, secondLevelIndex) =>
      secondLevel.forEach(([x, y], currentLevelIndex) => {
        // On ne rajoute pas le dernier point qui est égal au premier du contour...
        if (geojson_perimetre.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
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
