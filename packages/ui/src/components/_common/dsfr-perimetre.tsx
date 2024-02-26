import { defineComponent, HTMLAttributes, defineAsyncComponent, computed } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Router } from 'vue-router'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { DsfrLink } from '../_ui/dsfr-button'
import { contentTypes } from 'camino-common/src/rest'
import { ApiClient } from '../../api/api-client'
import { TabCaminoTable, transformMultipolygonToPoints } from './dsfr-perimetre-table'
import { OmitDistributive, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { TransformableGeoSystemeId } from 'camino-common/src/static/geoSystemes'
export type TabId = 'carte' | 'points'


type Props = {
  perimetre: { 
    geojson4326_perimetre: FeatureMultiPolygon
    geojson4326_points: FeatureCollectionPoints | null
    geojson_origine_geo_systeme_id: TransformableGeoSystemeId
    geojson_origine_perimetre: FeatureMultiPolygon
    geojson_origine_points: FeatureCollectionPoints | null
  }
  titreSlug: TitreSlug
  initTab?: TabId
  class?: HTMLAttributes['class']
} & (
  | { calculateNeighbours: true; router: Pick<Router, 'push'>; apiClient: Pick<ApiClient, 'getTitresWithPerimetreForCarte' | 'getGeojsonByGeoSystemeId'> }
  | { apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>; calculateNeighbours: false }
)

const maxRows = 20

/**
 * Attention, lors de l'import de ce composant, réfléchir si il faut l'importer en async ou pas pour ne pas l'embarquer dans le bundle principal
 *
 */
export const DsfrPerimetre = defineComponent<Props>((props: Props) => {
  const geojson4326Points = computed<FeatureCollectionPoints>(() => {
    if (isNotNullNorUndefined(props.perimetre.geojson4326_points)) {
      return props.perimetre.geojson4326_points
    }

    return transformMultipolygonToPoints(props.perimetre.geojson4326_perimetre)
  })
  const geojsonOriginePoints = computed<FeatureCollectionPoints>(() => {
    if (isNotNullNorUndefined(props.perimetre.geojson_origine_points)) {
      return props.perimetre.geojson_origine_points
    }

    return transformMultipolygonToPoints(props.perimetre.geojson_origine_perimetre)
  })

  const vues = [
    {
      id: 'carte',
      icon: 'fr-icon-earth-fill',
      title: 'Carte',
      renderContent: () => <TabCaminoMap {...props} perimetre={{ ...props.perimetre, geojson4326_points: geojson4326Points.value }} />,
    },
    {
      id: 'points',
      icon: 'fr-icon-list-unordered',
      title: 'Tableau',
      renderContent: () => <TabCaminoTable geojson_origine_points={geojsonOriginePoints.value} titreSlug={props.titreSlug} geo_systeme_id={props.perimetre.geojson_origine_geo_systeme_id} maxRows={maxRows} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

type TabCaminoMapProps = OmitDistributive<Props, 'perimetre'> & { perimetre: { geojson4326_perimetre: FeatureMultiPolygon; geojson4326_points: FeatureCollectionPoints } }
const TabCaminoMap = defineComponent<TabCaminoMapProps>(props => {
  const neighbours = props.calculateNeighbours ? { apiClient: props.apiClient, titreSlug: props.titreSlug, router: props.router } : null

  const DemarcheMap = defineAsyncComponent(async () => {
    const { DemarcheMap } = await import('../demarche/demarche-map')

    return DemarcheMap
  })

  const geojson = { type: 'FeatureCollection', properties: null, features: [props.perimetre.geojson4326_perimetre, ...props.perimetre.geojson4326_points.features] }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DemarcheMap perimetre={props.perimetre} style={{ minHeight: '400px' }} class="fr-mb-1w" maxMarkers={maxRows} neighbours={neighbours} />
      <DsfrLink
        style={{ alignSelf: 'end' }}
        href={`data:${contentTypes.geojson};charset=utf-8,${encodeURI(JSON.stringify(geojson))}`}
        download={`perimetre-${props.titreSlug}.geojson`}
        icon="fr-icon-download-line"
        buttonType="secondary"
        title="Télécharge le périmètre au format geojson"
        label=".geojson"
      />
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrPerimetre.props = ['perimetre', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoMap.props = ['perimetre', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']
