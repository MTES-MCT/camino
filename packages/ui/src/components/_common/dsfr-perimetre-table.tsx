import { contentTypes } from 'camino-common/src/rest'
import { GeoSysteme, GeoSystemes, GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { DeepReadonly, defineComponent, FunctionalComponent } from 'vue'
import { DsfrLink } from '../_ui/dsfr-button'
import { TableRow, TextColumnData } from '../_ui/table'
import { TableAuto, Column } from '../_ui/table-auto'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { capitalize } from 'camino-common/src/strings'
import { indexToLetter, toDegresMinutes } from 'camino-common/src/number'
import { NotNullableKeys, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { GeoSystemeTypeahead } from './geosysteme-typeahead'

interface Props {
  geojson_origine_points: DeepReadonly<FeatureCollectionPoints>
  geojson_origine_forages: DeepReadonly<FeatureCollectionForages> | null
  geo_systeme_id: GeoSystemeId
  titreSlug: TitreSlug
  maxRows: number
}

const labels = {
  met: { x: 'x', y: 'y' },
  deg: { x: 'longitude', y: 'latitude' },
  gon: { x: 'longitude', y: 'latitude' },
} as const satisfies Record<GeoSysteme['uniteId'], { x: string; y: string }>

const geoJsonToArray = (perimetre: DeepReadonly<FeatureCollectionPoints | FeatureCollectionForages>): TableRow<string>[] => {
  return perimetre.features.map<TableRow<string>>((feature, index) => {
    const x_deg = toDegresMinutes(feature.geometry.coordinates[0])
    const y_deg = toDegresMinutes(feature.geometry.coordinates[1])

    let foragesProperties
    if ('profondeur' in feature.properties) {
      foragesProperties = {
        profondeur: { value: `${feature.properties.profondeur}` },
        type: { value: capitalize(feature.properties.type) },
      }
    }

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
        ...foragesProperties,
      },
    }
  })
}

const TablePoints: FunctionalComponent<Pick<Props, 'geo_systeme_id' | 'geojson_origine_points' | 'maxRows' | 'titreSlug'> & { caption: string }> = props => {
  const uniteId = GeoSystemes[props.geo_systeme_id].uniteId

  const columns: Column<string>[] = [
    { id: 'nom', name: 'Nom du point', noSort: true },
    { id: 'description', name: 'Description', noSort: true },
    { id: 'x', name: capitalize(labels[uniteId].x), noSort: true },
    { id: 'y', name: capitalize(labels[uniteId].y), noSort: true },
  ]

  if (uniteId === 'deg') {
    columns.push({ id: 'x_deg', name: 'Longitude (E)', noSort: true }, { id: 'y_deg', name: 'Latitude (N)', noSort: true })
  }

  const currentRows = geoJsonToArray(props.geojson_origine_points)

  const rowsToDisplay = currentRows.slice(0, props.maxRows)

  const values = currentRows.map(({ columns: c }) => columns.map(({ id }) => c[id]?.value ?? '').join(';'))

  const csvContent = encodeURI(`${columns.map(c => (c.id === 'x' || c.id === 'y' ? labels[uniteId][c.id] : c.id)).join(';')}\n${values.join('\n')}`)

  if (currentRows.length > props.maxRows + 1) {
    rowsToDisplay.push({
      id: `${props.maxRows + 1}`,
      link: null,
      columns: columns.reduce<Record<string, TextColumnData>>((acc, { id }) => {
        acc[id] = { value: '...' }

        return acc
      }, {}),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TableAuto caption={props.caption} class="fr-mb-1w" columns={columns} rows={rowsToDisplay} initialSort="noSort" />

      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.csv};charset=utf-8,${csvContent}`}
        download={`points-${props.titreSlug}.csv`}
        icon="fr-icon-download-line"
        buttonType="secondary"
        title="Télécharge les points au format csv"
        label=".csv"
      />
    </div>
  )
}

const TableForages: FunctionalComponent<NotNullableKeys<Pick<Props, 'geo_systeme_id' | 'geojson_origine_forages' | 'titreSlug'>>> = props => {
  const uniteId = GeoSystemes[props.geo_systeme_id].uniteId

  const columns: Column<string>[] = [
    { id: 'nom', name: 'Nom', noSort: true },
    { id: 'description', name: 'Description', noSort: true },
    { id: 'profondeur', name: 'Profondeur (NGF)', noSort: true },
    { id: 'type', name: 'Type', noSort: true },
    { id: 'x', name: capitalize(labels[uniteId].x), noSort: true },
    { id: 'y', name: capitalize(labels[uniteId].y), noSort: true },
  ]

  const currentRows = geoJsonToArray(props.geojson_origine_forages)

  const values = currentRows.map(({ columns: c }) => columns.map(({ id }) => (id === 'type' ? `${c.type.value}`.toLowerCase() : c[id]?.value ?? '')).join(';'))

  const csvContent = encodeURI(`${columns.map(c => (c.id === 'x' || c.id === 'y' ? labels[uniteId][c.id] : c.id)).join(';')}\n${values.join('\n')}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TableAuto caption="Forages" class="fr-mb-1w" columns={columns} rows={currentRows} initialSort="noSort" />

      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.csv};charset=utf-8,${csvContent}`}
        download={`forages-${props.titreSlug}.csv`}
        icon="fr-icon-download-line"
        buttonType="secondary"
        title="Télécharge les forages au format csv"
        label=".csv"
      />
    </div>
  )
}

export const TabCaminoTable = defineComponent<Props>(props => {
  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GeoSystemeTypeahead disabled={true} geoSystemeId={props.geo_systeme_id} />

      <TablePoints caption={isNotNullNorUndefined(props.geojson_origine_forages) ? 'Points' : ''} {...props} />

      {isNotNullNorUndefined(props.geojson_origine_forages) ? (
        <TableForages geo_systeme_id={props.geo_systeme_id} geojson_origine_forages={props.geojson_origine_forages} titreSlug={props.titreSlug} />
      ) : null}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoTable.props = ['geojson_origine_points', 'geojson_origine_forages', 'geo_systeme_id', 'titreSlug', 'maxRows']

export const transformMultipolygonToPoints = (geojson_perimetre: DeepReadonly<FeatureMultiPolygon>): DeepReadonly<FeatureCollectionPoints> => {
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
