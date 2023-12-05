import { FunctionalComponent, defineComponent, HTMLAttributes, defineAsyncComponent } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { TitreApiClient } from '../titre/titre-api-client'
import { TitreSlug } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { DsfrLink } from '../_ui/dsfr-button'
import { contentTypes } from 'camino-common/src/rest'
export type TabId = 'carte' | 'points'
export interface Props {
  geojsonMultiPolygon: FeatureMultiPolygon
  apiClient: Pick<TitreApiClient, 'getTitresWithPerimetreForCarte'> | null
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
      renderContent: () => <TabCaminoTable geojsonMultiPolygon={props.geojsonMultiPolygon} titreSlug={props.titreSlug} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

const columns: Column<string>[] = [
  { id: 'polygone', name: 'Polygone', noSort: true },
  { id: 'nom', name: 'Point', sort: () => -1, noSort: true },
  { id: 'latitude', name: 'Latitude', noSort: true },
  { id: 'longitude', name: 'Longitude', noSort: true },
]
const TabCaminoTable: FunctionalComponent<Pick<Props, 'geojsonMultiPolygon' | 'titreSlug'>> = props => {
  let index = 0
  const currentRows: TableRow<string>[] = []
  props.geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
    topLevel.forEach((secondLevel, secondLevelIndex) =>
      secondLevel.forEach(([y, x], currentLevelIndex) => {
        // On ne rajoute pas le dernier point qui est égal au premier du contour...
        if (props.geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
          currentRows.push({
            id: `${index}`,
            link: null,
            columns: {
              polygone: { value: `Polygone ${topLevelIndex + 1}${secondLevelIndex > 0 ? ` - Lacune ${secondLevelIndex}` : ''}` },
              nom: { value: `${index}` },
              latitude: { value: `${y}` },
              longitude: { value: `${x}` },
            },
          })
          index++
        }
      })
    )
  )

  const csvContent = encodeURI(
    `${columns.map(c => c.name).join(';')}\n${currentRows.map(({ columns }) => `${columns.polygone.value};${columns.nom.value};${columns.latitude.value};${columns.longitude.value}`).join('\n')}`
  )

  if (index > maxRows + 1) {
    currentRows.splice(maxRows, index)
    currentRows.push({ id: '11', link: null, columns: { polygone: { value: '...' }, nom: { value: '...' }, latitude: { value: '...' }, longitude: { value: '...' } } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TableAuto caption="" class="fr-mb-1w" columns={columns} rows={currentRows} initialSort={{ column: 'nom', order: 'asc' }} />

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

const TabCaminoMap = defineComponent<Props>(props => {
  const neighbours = isNullOrUndefined(props.apiClient) ? null : { apiClient: props.apiClient, titreSlug: props.titreSlug }

  const DemarcheMap = defineAsyncComponent(async () => {
    const { DemarcheMap } = await import('../demarche/demarche-map')

    return DemarcheMap
  })

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DemarcheMap geojsonMultiPolygon={props.geojsonMultiPolygon} style={{ minHeight: '400px' }} class="fr-mb-1w" maxMarkers={maxRows} neighbours={neighbours} router={props.router} />
      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.geojson};charset=utf-8,${encodeURI(JSON.stringify(props.geojsonMultiPolygon))}`}
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
DsfrPerimetre.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoMap.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab']
