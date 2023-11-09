import { FunctionalComponent, Ref, computed, defineComponent, ref, watch } from 'vue'
import { Tab, Tabs } from '../_ui/tabs'
import { CaminoMap } from '../_map/index'
import { leafletDivIconBuild, leafletGeojsonBuild, leafletMarkerBuild } from '../_map/leaflet'
import { LatLngTuple, Layer, LayerGroup, Marker, layerGroup } from 'leaflet'
import { TitreWithPoint, layersBuild } from '../titres/mapUtil'
import { TitreApiClient } from '../titre/titre-api-client'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TitreSlug } from 'camino-common/src/titres'
import { Router } from 'vue-router'
import { Column, TableAuto } from '../_ui/table-auto'
import { TableRow } from '../_ui/table'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
export type TabId = 'carte' | 'points'
export interface Props {
  geojsonMultiPolygon: FeatureMultiPolygon
  apiClient: Pick<TitreApiClient, 'getTitresWithPerimetreForCarte'> | null
  titreSlug: TitreSlug
  router: Pick<Router, 'push'>
  initTab?: TabId
}

const maxRows = 20

// TODO 2023-10-18 --> question à Sarah pour le tableau -> pouvoir changer le référentiel
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
      renderContent: () => <TabCaminoTable geojsonMultiPolygon={props.geojsonMultiPolygon} />,
    },
  ] as const satisfies readonly Tab<TabId>[]

  return () => <Tabs initTab={props.initTab ?? 'carte'} tabs={vues} tabsTitle={'Affichage des titres en vue carte ou tableau'} tabClicked={_newTabId => {}} />
})

const columns: Column<string>[] = [
  { id: 'polygone', name: 'Polygone', noSort: true },
  { id: 'nom', name: 'Référentiel WGS 84', sort: () => -1, noSort: true },
  { id: 'latitude', name: 'Latitude', noSort: true },
  { id: 'longitude', name: 'Longitude', noSort: true },
]
const TabCaminoTable: FunctionalComponent<Pick<Props, 'geojsonMultiPolygon'>> = props => {
  const rows = computed<TableRow<string>[]>(() => {
    let index = 1
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
    if (index > maxRows + 1) {
      currentRows.splice(maxRows, index)
      currentRows.push({ id: '11', link: null, columns: { polygone: { value: '...' }, nom: { value: '...' }, latitude: { value: '...' }, longitude: { value: '...' } } })
    }

    return currentRows
  })

  return <TableAuto caption="" columns={columns} rows={rows.value} initialSort={{ column: 'nom', order: 'asc' }} />
}

const TabCaminoMap = defineComponent<Props>(props => {
  const map = ref<typeof CaminoMap | null>(null)

  const geojsonLayers = ref<Layer[]>([]) as Ref<Layer[]>
  const markerLayers = ref<Layer[]>([]) as Ref<Layer[]>
  watch(
    () => [props.geojsonMultiPolygon, map.value],
    () => {
      map.value?.clearAllLayers()

      const geojsonLayer = leafletGeojsonBuild(props.geojsonMultiPolygon, {
        style: { fillOpacity: 0.2, weight: 3, color: 'var(--blue-france-sun-113-625)' },
        interactive: false,
      })
      const bounds = isNotNullNorUndefined(geojsonLayer)
        ? geojsonLayer.getBounds()
        : [
            [0, 0],
            [0, 0],
          ]

      map.value?.boundsFit(bounds)

      geojsonLayers.value = [geojsonLayer]

      let index = 1
      const markers: Marker<any>[] = []
      props.geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
        topLevel.forEach((secondLevel, secondLevelIndex) =>
          secondLevel.forEach(([x, y], currentLevelIndex) => {
            // On ne rajoute pas le dernier point qui est égal au premier du contour...
            if (props.geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
              const icon = leafletDivIconBuild({
                className: 'fr-text--sm',
                html: `<div class="leaflet-marker-camino-dsfr">${index}</div>`,
                iconSize: [32, 32],
              })

              const latLng: LatLngTuple = [y, x]
              const titreMarker = leafletMarkerBuild(latLng, icon, { interactive: true })
              titreMarker.bindPopup(
                `<div><div>Latitude : <span class="fr-text--md leaflet-marker-camino-dsfr-popup">${y}</span></div><div>Longitude : <span class="fr-text--md leaflet-marker-camino-dsfr-popup">${x}</span></div></div>`,
                { closeButton: false }
              )
              markers.push(titreMarker)
              index++
            }
          })
        )
      )

      markerLayers.value = markers
    },
    { immediate: true }
  )

  const loading = ref(false)

  const titresValidesGeojson = ref<TitreWithPoint[]>([])

  const mapUpdate = async (data: { center?: number[]; zoom?: number; bbox?: [number, number, number, number] }) => {
    if (isNotNullNorUndefined(props.apiClient)) {
      loading.value = true

      try {
        const res: { elements: TitreWithPoint[] } = await props.apiClient.getTitresWithPerimetreForCarte({
          statutsIds: [TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
          perimetre: data.bbox,
          communes: '',
          departements: [],
          domainesIds: [],
          entreprisesIds: [],
          facadesMaritimes: [],
          references: '',
          regions: [],
          substancesIds: [],
          titresIds: [],
          typesIds: [],
        })
        titresValidesGeojson.value = res.elements.filter(({ slug }) => slug !== props.titreSlug)
      } catch (e) {
        console.error(e)
      }
      loading.value = false
    }
  }

  const titresValidesLayer = ref<LayerGroup>(layerGroup([])) as Ref<LayerGroup>

  const additionalOverlayLayers = computed<Record<string, LayerGroup> | undefined>(() => {
    if (isNotNullNorUndefined(props.apiClient)) {
      titresValidesLayer.value.clearLayers()

      const { geojsons, markers } = layersBuild(titresValidesGeojson.value, props.router)
      Object.values(geojsons).forEach(g => titresValidesLayer.value.addLayer(g))
      markers.forEach(q => q.marker.addTo(titresValidesLayer.value))

      return {
        'Titres valides': titresValidesLayer.value,
      }
    }

    return undefined
  })

  return () => (
    <CaminoMap
      ref={map}
      loading={loading.value}
      mapUpdate={mapUpdate}
      geojsonLayers={geojsonLayers.value}
      markerLayers={markerLayers.value}
      maxMarkers={maxRows}
      additionalOverlayLayers={additionalOverlayLayers.value}
      style={{ minHeight: '400px' }}
    />
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DsfrPerimetre.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab']

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
TabCaminoMap.props = ['geojsonMultiPolygon', 'apiClient', 'titreSlug', 'router', 'initTab']
