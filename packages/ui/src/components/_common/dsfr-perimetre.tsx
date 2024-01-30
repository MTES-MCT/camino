import { defineComponent, HTMLAttributes, defineAsyncComponent } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { Router } from 'vue-router'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { DsfrLink } from '../_ui/dsfr-button'
import { contentTypes } from 'camino-common/src/rest'
import { ApiClient } from '../../api/api-client'
import { TabCaminoTable } from './dsfr-perimetre-table'
export type TabId = 'carte' | 'points'
type Props = {
  perimetre: { geojson4326_perimetre: FeatureMultiPolygon; geojson4326_points: FeatureCollectionPoints | null }
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
      renderContent: () => <TabCaminoTable perimetre={props.perimetre} titreSlug={props.titreSlug} apiClient={props.apiClient} maxRows={maxRows} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

const TabCaminoMap = defineComponent<Props>(props => {
  const neighbours = props.calculateNeighbours ? { apiClient: props.apiClient, titreSlug: props.titreSlug, router: props.router } : null

  const DemarcheMap = defineAsyncComponent(async () => {
    const { DemarcheMap } = await import('../demarche/demarche-map')

    return DemarcheMap
  })

  // FIXME normalement ici on doit juste retourner le geojson4326_perimetre à la fin
  const geojson = { type: 'FeatureCollection', properties: null, features: [props.perimetre.geojson4326_perimetre] }

  return () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DemarcheMap perimetre={props.perimetre} style={{ minHeight: '400px' }} class="fr-mb-1w" maxMarkers={maxRows} neighbours={neighbours} />
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
DsfrPerimetre.props = ['perimetre', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoMap.props = ['perimetre', 'apiClient', 'titreSlug', 'router', 'initTab', 'calculateNeighbours']
