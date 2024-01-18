import { defineComponent, HTMLAttributes, defineAsyncComponent } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { TitreSlug } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { DsfrLink } from '../_ui/dsfr-button'
import { contentTypes } from 'camino-common/src/rest'
import { ApiClient } from '../../api/api-client'
import { TabCaminoTable } from './dsfr-perimetre-table'
export type TabId = 'carte' | 'points'
type Props = {
  geojsonMultiPolygon: FeatureMultiPolygon

  titreSlug: TitreSlug
  router: Pick<Router, 'push'>
  initTab?: TabId
  class?: HTMLAttributes['class']
} & (
  | { calculateNeighbours: true; apiClient: Pick<ApiClient, 'getTitresWithPerimetreForCarte' | 'getGeojsonByGeoSystemeId'> }
  | { apiClient: Pick<ApiClient, 'getGeojsonByGeoSystemeId'>; calculateNeighbours: false }
)

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
      renderContent: () => <TabCaminoTable geojsonMultiPolygon={props.geojsonMultiPolygon} titreSlug={props.titreSlug} apiClient={props.apiClient} maxRows={maxRows} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

const TabCaminoMap = defineComponent<Props>(props => {
  // CE BUG DETECTE PAR LE TYPAGE :HEART:
  const neighbours = props.calculateNeighbours ? { apiClient: props.apiClient, titreSlug: props.titreSlug } : null

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
