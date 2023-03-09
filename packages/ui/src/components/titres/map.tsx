import { nextTick, ref, Ref, computed, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import { CaminoMap } from '../_map/index'
import { leafletGeojsonBoundsGet } from '../_map/leaflet'
import { clustersBuild, layersBuild, zones, CaminoMarker, TitreWithPoint } from './mapUtil'
import { Icon } from '@/components/_ui/icon'
import { isDomaineId } from 'camino-common/src/static/domaines'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Layer, MarkerClusterGroup } from 'leaflet'
import { getKeys, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
interface Props {
  titres: TitreWithPoint[]
}

type ZoneId = (typeof zones)[number]['id']
export const CaminoTitresMap = caminoDefineComponent<Props>(['titres'], props => {
  const store = useStore()
  const router = useRouter()
  const matomo = inject('matomo', null)
  const map = ref<typeof CaminoMap | null>(null)

  const zoneId = ref<ZoneId>('fr')
  const geojsons = ref<Record<string, Layer>>({})
  const clusters = ref<MarkerClusterGroup[]>([]) as Ref<MarkerClusterGroup[]>
  const markers = ref<CaminoMarker[]>([]) as Ref<CaminoMarker[]>

  const geojsonLayers = ref<Layer[]>([]) as Ref<Layer[]>

  const markerLayersId = computed(() => {
    return store.state.user.preferences.carte.markerLayersId
  })

  const markerLayers = computed<Layer[]>(() => {
    if (markerLayersId.value === 'clusters') {
      return clusters.value
    } else if (markerLayersId.value === 'markers') {
      return markers.value.map(marker => marker.marker)
    }

    return []
  })

  const zone = computed(() => {
    return zones.find(z => z.id === zoneId.value)
  })

  const bounds = computed(() => {
    return leafletGeojsonBoundsGet(zone.value)
  })

  const preferences = computed(() => {
    return store.state.titres.params.carte
  })

  const init = () => {
    if (preferences.value.zoom && preferences.value.centre) {
      positionSet()
    } else {
      boundsFit()
    }
  }

  const titresInit = (titres: TitreWithPoint[]) => {
    const { geojsons: geojsonLayer, markers: markersLayer } = layersBuild(titres, router)
    const clustersBuilt = clustersBuild()
    geojsons.value = geojsonLayer
    markers.value = markersLayer
    markers.value.forEach(marker => {
      if (marker.domaineId) {
        const domaineCluster = clustersBuilt[marker.domaineId]
        if (domaineCluster) {
          domaineCluster.addLayer(marker.marker)
        }
      }
    })

    clusters.value = getKeys(clustersBuilt, isDomaineId)
      .map(domaineId => clustersBuilt[domaineId])
      .filter(isNotNullNorUndefined)

    geojsonLayersDisplay()
  }

  const titresPreferencesUpdate = (params: { center?: number[]; zoom?: number; bbox?: number[] }) => {
    if (params.center || params.zoom || params.bbox) {
      const myParams: {
        zoom?: number
        centre?: number[]
        perimetre?: number[]
      } = { zoom: params.zoom }
      if (params.center) {
        myParams.centre = params.center
      }

      if (params.bbox) {
        myParams.perimetre = params.bbox
      }

      store.dispatch('titres/paramsSet', {
        section: 'carte',
        params: myParams,
      })
    }
  }

  const mapCenter = (newZoneId: ZoneId) => {
    if (zoneId.value !== newZoneId) {
      zoneId.value = newZoneId
    }

    boundsFit()
  }

  const mapFrame = async () => {
    const params = { perimetre: [-180, -90, 180, 90] }

    await store.dispatch('titres/paramsSet', {
      section: 'carte',
      params,
    })

    if (map.value) {
      // le traitement au dessus peut-être très long et l’utilisateur a pu changer de page
      map.value.allFit()
    }
  }

  const boundsFit = () => {
    map.value?.boundsFit(bounds.value)
  }

  const positionSet = () => {
    const zoom = preferences.value.zoom
    const center = preferences.value.centre
    map.value?.positionSet({ zoom, center })
  }

  const popState = () => {
    positionSet()
  }

  const geojsonLayersDisplay = () => {
    nextTick(() => {
      geojsonLayers.value = []
      markers.value.forEach(marker => {
        if ((markerLayersId.value !== 'clusters' || map.value) && marker.id) {
          geojsonLayers.value.push(geojsons.value[marker.id])
        }
      })
    })
  }

  const markerLayersIdSet = (markerLayersId: 'clusters' | 'markers' | 'none') => {
    const params = { markerLayersId }
    if (matomo) {
      // @ts-ignore
      matomo.trackEvent('titres-vue', 'titre-id-fond-carte')
    }
    store.dispatch('user/preferencesSet', {
      section: 'carte',
      params,
    })
    geojsonLayersDisplay()
  }

  onMounted(() => {
    init()
    window.addEventListener('popstate', popState)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('popstate', popState)
  })

  watch(
    () => props.titres,
    titres => {
      titresInit(titres)
    },
    { immediate: true }
  )
  return () => (
    <div class="width-full bg-alt">
      <CaminoMap ref={map} markerLayers={markerLayers.value} geojsonLayers={geojsonLayers.value} mapUpdate={titresPreferencesUpdate} class="map map-view mb-s" />

      <div class="container overflow-auto">
        <div class="desktop-blobs">
          <div class="desktop-blob-1-2 desktop-flex">
            <div class="mb-s">
              <span class="mr-s">
                <button class="btn-border small rnd-m px-s py-xs" onClick={() => mapFrame()}>
                  Tout afficher
                </button>
              </span>
            </div>
            <ul class="list-inline pill-list mb-s">
              {zones.map(z => (
                <li key={z.id} class="mr-px mb-px">
                  <button class="btn-border small pill-item px-s py-xs" onClick={() => mapCenter(z.id)}>
                    {z.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div class="desktop-blob-1-2 desktop-flex">
            <div class="flex mb-s">
              <div class={`${markerLayersId.value === 'clusters' ? 'active' : ''}`}>
                <button class="btn-border p-s rnd-l-s" title="regroupe les marqueurs" onClick={() => markerLayersIdSet('clusters')}>
                  <Icon size="M" name="marker-cluster" />
                </button>
              </div>
              <div class={`${markerLayersId.value === 'markers' ? 'active' : ''}`}>
                <button class="btn-border p-s" title="affiche les marqueurs" onClick={() => markerLayersIdSet('markers')}>
                  <Icon size="M" name="marker-ungrouped" />
                </button>
              </div>
              <div class={`${markerLayersId.value === 'none' ? 'active' : ''} mr-s`}>
                <button class="btn-border p-s rnd-r-s" title="affiche les contours uniquement" onClick={() => markerLayersIdSet('none')}>
                  <Icon size="M" name="marker-none" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
