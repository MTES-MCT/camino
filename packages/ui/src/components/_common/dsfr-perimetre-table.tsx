import { contentTypes } from 'camino-common/src/rest'
import { GeoSysteme, GeoSystemes, GeoSystemeId } from 'camino-common/src/static/geoSystemes'
import { defineComponent, FunctionalComponent } from 'vue'
import { DsfrLink } from '../_ui/dsfr-button'
import { TableRow, TextColumnData } from '../_ui/table'
import { TableSimple, Column } from '../_ui/table-simple'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { capitalize } from 'camino-common/src/strings'
import { KM2, indexToLetter, toDegresMinutes } from 'camino-common/src/number'
import { NotNullableKeys, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { GeoSystemeTypeahead } from './geosysteme-typeahead'

interface Props {
  geojson_origine_points: FeatureCollectionPoints
  geojson_origine_forages: FeatureCollectionForages | null
  geo_systeme_id: GeoSystemeId
  surface: KM2 | null
  titreSlug: TitreSlug
  maxRows: number
}

const labels = {
  met: { x: 'x', y: 'y' },
  deg: { x: 'longitude', y: 'latitude' },
  gon: { x: 'longitude', y: 'latitude' },
} as const satisfies Record<GeoSysteme['uniteId'], { x: string; y: string }>

const geoJsonToArray = (perimetre: FeatureCollectionPoints | FeatureCollectionForages): TableRow<string>[] => {
  return perimetre.features.map<TableRow<string>>((feature, index) => {
    const x_deg = toDegresMinutes(feature.geometry.coordinates[0])
    const y_deg = toDegresMinutes(feature.geometry.coordinates[1])

    let foragesProperties: TableRow<string>['columns'] = {}
    if ('profondeur' in feature.properties) {
      foragesProperties = {
        profondeur: { type: 'text', value: `${feature.properties.profondeur}` },
        type: { type: 'text', value: capitalize(feature.properties.type) },
      }
    }

    return {
      id: `${index}`,
      link: null,
      columns: {
        description: { type: 'text', value: feature.properties.description ?? '' },
        nom: { type: 'text', value: feature.properties.nom ?? '' },
        x: { type: 'text', value: `${feature.geometry.coordinates[0]}` },
        y: { type: 'text', value: `${feature.geometry.coordinates[1]}` },
        x_deg: { type: 'text', value: `${x_deg.degres}°${Intl.NumberFormat('fr-FR').format(x_deg.minutes)}'` },
        y_deg: { type: 'text', value: `${y_deg.degres}°${Intl.NumberFormat('fr-FR').format(y_deg.minutes)}'` },
        ...foragesProperties,
      },
    }
  })
}

const TablePoints: FunctionalComponent<Pick<Props, 'geo_systeme_id' | 'geojson_origine_points' | 'maxRows' | 'titreSlug' | 'surface'> & { caption: string }> = props => {
  const uniteId = GeoSystemes[props.geo_systeme_id].uniteId

  const columns: Column<string>[] = [
    { id: 'nom', contentTitle: 'Nom du point' },
    { id: 'description', contentTitle: 'Description' },
    { id: 'x', contentTitle: capitalize(labels[uniteId].x) },
    { id: 'y', contentTitle: capitalize(labels[uniteId].y) },
  ]

  if (uniteId === 'deg') {
    columns.push({ id: 'x_deg', contentTitle: 'Longitude (E)' }, { id: 'y_deg', contentTitle: 'Latitude (N)' })
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
        acc[id] = { type: 'text', value: '...' }

        return acc
      }, {}),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TableSimple caption={{ value: props.caption, visible: true }} class="fr-mb-1w" columns={columns} rows={rowsToDisplay} />

      <div style={{ display: 'flex' }}>
        {isNotNullNorUndefined(props.surface) ? <div class="fr-text--md">Surface : {props.surface} Km²</div> : null}
        <DsfrLink
          style={{ marginLeft: 'auto' }}
          href={`data:${contentTypes.csv};charset=utf-8,${csvContent}`}
          download={`points-${props.titreSlug}.csv`}
          icon="fr-icon-download-line"
          buttonType="secondary"
          title="Télécharge les points au format csv"
          label=".csv"
        />
      </div>
    </div>
  )
}

const TableForages: FunctionalComponent<NotNullableKeys<Pick<Props, 'geo_systeme_id' | 'geojson_origine_forages' | 'titreSlug'>>> = props => {
  const uniteId = GeoSystemes[props.geo_systeme_id].uniteId

  const columns: Column<string>[] = [
    { id: 'nom', contentTitle: 'Nom' },
    { id: 'description', contentTitle: 'Description' },
    { id: 'profondeur', contentTitle: 'Profondeur (NGF)' },
    { id: 'type', contentTitle: 'Type' },
    { id: 'x', contentTitle: capitalize(labels[uniteId].x) },
    { id: 'y', contentTitle: capitalize(labels[uniteId].y) },
  ]

  const currentRows = geoJsonToArray(props.geojson_origine_forages)

  const values = currentRows.map(({ columns: c }) => columns.map(({ id }) => (id === 'type' ? `${c.type.value}`.toLowerCase() : (c[id]?.value ?? ''))).join(';'))

  const csvContent = encodeURI(`${columns.map(c => (c.id === 'x' || c.id === 'y' ? labels[uniteId][c.id] : c.id)).join(';')}\n${values.join('\n')}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TableSimple caption={{ value: 'Forages', visible: true }} class="fr-mb-1w" columns={columns} rows={currentRows} />

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
TabCaminoTable.props = ['geojson_origine_points', 'geojson_origine_forages', 'geo_systeme_id', 'titreSlug', 'maxRows', 'surface']

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
