import { ref, Ref, computed, onMounted, watch, defineComponent, DefineComponent } from 'vue'
import { CaminoMap, Props as CaminoMapProps } from '../_map/index'
import { leafletGeojsonBoundsGet } from '../_map/leaflet'
import { clustersBuild, layersBuild, zones, TitreWithPerimetre, CaminoMarkerClusterGroup, LayerWithTitreId, regionsCoordinates } from './mapUtil'
import { DomaineId, isDomaineId } from 'camino-common/src/static/domaines'
import { onBeforeRouteLeave } from 'vue-router'
import { Layer, LayerGroup, Marker, layerGroup } from 'leaflet'
import { getEntriesHardcore, getKeys, isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { DsfrButton } from '../_ui/dsfr-button'
import { routerQueryToNumber, routerQueryToNumberArray } from '@/router/camino-router-link'
import { TitreId } from 'camino-common/src/validators/titres'
import { Entreprise } from 'camino-common/src/entreprise'
import { User, isAdministration } from 'camino-common/src/roles'
import { RegionId } from 'camino-common/src/static/region'
import { Administrations } from 'camino-common/src/static/administrations'
import { Departements } from 'camino-common/src/static/departement'
import { CaminoRouter } from '@/typings/vue-router'
export type TitreCarteParams = {
  zoom: number
  centre: [number, number]
  perimetre: [number, number, number, number]
} | null
interface Props {
  titres: { hash: string; titres: TitreWithPerimetre[] }
  entreprises: Entreprise[]
  user: User
  updateCarte: (params: TitreCarteParams) => void
  router: CaminoRouter
  loading: boolean
}

const isLayerWithTitreId = (layer: Layer): layer is LayerWithTitreId => 'titreId' in layer

type ZoneId = keyof typeof zones
export const CaminoTitresMap = defineComponent<Props>(props => {
  const zoneId = ref<ZoneId | null>(null)
  const savedParams = computed<TitreCarteParams>(() => {
    const route = props.router.currentRoute.value

    const zoom = routerQueryToNumber(route.query.zoom, Number.NaN)
    const centre = routerQueryToNumberArray(route.query.centre, [Number.NaN, Number.NaN]) as [number, number]
    const perimetre = routerQueryToNumberArray(route.query.perimetre, [Number.NaN, Number.NaN, Number.NaN, Number.NaN]) as [number, number, number, number]

    return { zoom, centre, perimetre }
  })

  onBeforeRouteLeave(() => {
    stop()
  })

  const stop = watch(
    savedParams,
    (newSavedParams, old) => {
      if (!Number.isNaN(newSavedParams?.zoom)) {
        if (JSON.stringify(newSavedParams) !== JSON.stringify(old)) {
          return props.updateCarte(newSavedParams)
        }
      }
    },
    { immediate: true }
  )

  const map = ref<DefineComponent<CaminoMapProps> | null>(null)

  const geojsons = ref<Record<TitreId, Layer>>({})
  const clusters = ref<CaminoMarkerClusterGroup[]>([]) as Ref<CaminoMarkerClusterGroup[]>
  const geojsonLayers = ref<LayerGroup>(layerGroup([])) as Ref<LayerGroup>

  let initialCoordinates: [[number, number], [number, number]] = zones.fr.coordinates
  if (isAdministration(props.user)) {
    const administration = Administrations[props.user.administrationId]
    let regionId: RegionId | null = administration.regionId ?? null
    if (isNotNullNorUndefined(administration.departementId)) {
      regionId = Departements[administration.departementId].regionId
    }

    if (isNotNullNorUndefined(regionId)) {
      initialCoordinates = regionsCoordinates[regionId]
    }
  }
  const boundsCoordinates = ref<[[number, number], [number, number]]>(initialCoordinates)

  const bounds = computed(() => {
    return leafletGeojsonBoundsGet({ type: 'LineString', coordinates: boundsCoordinates.value })
  })

  const init = () => {
    if (!Number.isNaN(savedParams.value?.zoom)) {
      positionSet()
    } else {
      boundsFit()
    }
  }

  const layerIdToTitreIdDisplayed = ref<Record<TitreId, TitreId>>({})

  const previoushash = ref<string | null>(null)
  const titresInit = ({ hash, titres }: { hash: string; titres: TitreWithPerimetre[] }) => {
    const titreIdsToBeOnMap = titres.map(({ id }) => id)
    const markersTitreIdsAlreadyInMap = Object.values(layerIdToTitreIdDisplayed.value)
    const geojsonsTitreIdsAlreadyInMap = Object.keys(geojsons.value) as TitreId[]
    const { geojsons: geojsonLayer, markers: markersLayer } = layersBuild(titres, props.router, props.entreprises, markersTitreIdsAlreadyInMap, geojsonsTitreIdsAlreadyInMap)

    if (clusters.value.length === 0) {
      const clustersBuilt = clustersBuild()
      clusters.value = getKeys(clustersBuilt, isDomaineId)
        .map(domaineId => clustersBuilt[domaineId])
        .filter(isNotNullNorUndefined)
    }

    const markerLayersByDomaine = markersLayer.reduce<Record<DomaineId, Marker[]>>(
      (acc, marker) => {
        acc[marker.domaineId].push(marker.marker)
        layerIdToTitreIdDisplayed.value[marker.id] = marker.id

        return acc
      },
      { c: [], m: [], f: [], g: [], h: [], r: [], s: [], w: [] }
    )
    clusters.value.forEach(cluster => {
      if (cluster.caminoDomaineId && markerLayersByDomaine[cluster.caminoDomaineId].length > 0) {
        cluster.addLayers(markerLayersByDomaine[cluster.caminoDomaineId])
      }

      if (hash !== previoushash.value) {
        const layersToRemove = cluster.getLayers().filter(layer => {
          if (isLayerWithTitreId(layer) && !titreIdsToBeOnMap.includes(layer.titreId)) {
            delete layerIdToTitreIdDisplayed.value[layer.titreId]

            return true
          }

          return false
        })
        cluster.removeLayers(layersToRemove)
      }
    })

    getEntriesHardcore(geojsonLayer).forEach(([titreId, layer]) => {
      geojsons.value[titreId] = layer
      geojsonLayers.value.addLayer(layer)
    })

    if (hash !== previoushash.value) {
      geojsonLayers.value.getLayers().forEach(layer => {
        if (isLayerWithTitreId(layer) && !titreIdsToBeOnMap.includes(layer.titreId)) {
          geojsonLayers.value.removeLayer(layer)
          delete geojsons.value[layer.titreId]
        }
      })
    }
    previoushash.value = hash
  }

  const titresPreferencesUpdate = async (params: { center?: [number, number]; zoom?: number; bbox?: [number, number, number, number] }) => {
    let ourParam = { ...savedParams.value }
    if (ourParam === null) {
      if (isNullOrUndefined(params.center) || isNullOrUndefined(params.zoom) || isNullOrUndefined(params.bbox)) {
        console.error('Les paramètres ne sont pas initialisés et ne sont pas tous là')
      } else {
        ourParam = { centre: params.center, zoom: params.zoom, perimetre: params.bbox }
      }
    } else {
      if (isNotNullNorUndefined(params.zoom)) {
        ourParam.zoom = params.zoom
      }
      if (isNotNullNorUndefined(params.center)) {
        ourParam.centre = params.center
      }

      if (isNotNullNorUndefined(params.bbox)) {
        ourParam.perimetre = params.bbox
      }
    }

    const currentRoute = props.router.currentRoute.value
    await props.router.push({
      name: currentRoute.name ?? undefined,
      query: {
        ...currentRoute.query,
        ...ourParam,
        // TODO 2023-07-20 ugly hack pour corriger la race condition au niveau de la gestions des tabs dsfr...
        vueId: 'carte',
      },
      params: currentRoute.params,
    })
  }

  const mapCenter = (newZoneId: ZoneId) => {
    if (zoneId.value !== newZoneId) {
      zoneId.value = newZoneId
      boundsCoordinates.value = zones[newZoneId].coordinates
    }

    boundsFit()
  }

  const mapFrame = () => {
    if (map.value) {
      map.value.fitWorld()
    }
  }

  const boundsFit = () => {
    map.value?.boundsFit(bounds.value)
  }

  const positionSet = () => {
    if (savedParams.value !== null) {
      const zoom = savedParams.value.zoom
      const center = savedParams.value.centre
      map.value?.positionSet({ zoom, center })
    }
  }

  onMounted(() => {
    init()
  })

  watch(
    () => props.titres,
    titres => {
      titresInit(titres)
    },
    { immediate: true }
  )

  return () => (
    <div style={{ backgroundColor: 'var(--background-alt-blue-france)' }}>
      <CaminoMap ref={map} loading={props.loading} markerLayers={clusters.value} geojsonLayers={[geojsonLayers.value]} mapUpdate={titresPreferencesUpdate} class="map map-view mb-s" />

      <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-btns-group--center">
        <li>
          <DsfrButton onClick={() => mapFrame()} title="Tout afficher" buttonType="tertiary" />
        </li>
        {Object.values(zones).map(z => (
          <li key={z.id}>
            <DsfrButton buttonType="tertiary" onClick={() => mapCenter(z.id)} title={z.name} />
          </li>
        ))}
      </ul>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
CaminoTitresMap.props = ['titres', 'updateCarte', 'router', 'loading', 'entreprises', 'user']
