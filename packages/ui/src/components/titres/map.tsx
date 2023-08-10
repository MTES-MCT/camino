import { nextTick, ref, Ref, computed, onMounted, inject, watch } from 'vue'
import { CaminoMap } from '../_map/index'
import { leafletGeojsonBoundsGet } from '../_map/leaflet'
import { clustersBuild, layersBuild, zones, CaminoMarker, TitreWithPoint } from './mapUtil'
import { isDomaineId } from 'camino-common/src/static/domaines'
import { Router, onBeforeRouteLeave } from 'vue-router'
import { Layer, MarkerClusterGroup } from 'leaflet'
import { getKeys, isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { DsfrButton, DsfrButtonIcon } from '../_ui/dsfr-button'
import { routerQueryToNumber, routerQueryToNumberArray } from '@/router/camino-router-link'
import { TitreId } from 'camino-common/src/titres'
export type TitreCarteParams = {
  zoom: number
  centre: [number, number]
  perimetre: [number, number, number, number]
} | null
interface Props {
  titres: TitreWithPoint[]
  updateCarte: (params: TitreCarteParams) => void
  router: Router
}

type ZoneId = keyof typeof zones
// TODO 2023-07-20 je pense qu'on peut mettre pas mal de choses en cache ici, notamment les titres qu'on a chargés, avec et sans périmètres.
// Ça permettrait de rendre le front beaucoup plus fluide quand on joue avec la carte
// En plus, on a déjà des ids, ceux des titres, donc facile pour la mise en cache.
// à voir si on met en cache dans le composant ou ailleurs, pour garder les données le temps de la navigation, si l'utilisateur va sur les tableaux et revient par exemple
export const CaminoTitresMap = caminoDefineComponent<Props>(['titres', 'updateCarte', 'router'], props => {
  const zoneId = ref<ZoneId>('fr')
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

  const matomo = inject('matomo', null)
  const map = ref<typeof CaminoMap | null>(null)

  const geojsons = ref<Record<string, Layer>>({})
  const clusters = ref<MarkerClusterGroup[]>([]) as Ref<MarkerClusterGroup[]>
  const markers = ref<CaminoMarker[]>([]) as Ref<CaminoMarker[]>

  const geojsonLayers = ref<Layer[]>([]) as Ref<Layer[]>

  // TODO 2023-07-20 on veut mettre ça dans l'URL ?
  const markerLayersId = ref('clusters')

  const markerLayers = computed<Layer[]>(() => {
    if (markerLayersId.value === 'clusters') {
      return clusters.value
    } else if (markerLayersId.value === 'markers') {
      return markers.value.map(marker => marker.marker)
    }

    return []
  })

  const zone = computed(() => {
    return zones[zoneId.value]
  })

  const bounds = computed(() => {
    return leafletGeojsonBoundsGet(zone.value)
  })

  const init = () => {
    if (!Number.isNaN(savedParams.value?.zoom)) {
      positionSet()
    } else {
      boundsFit()
    }
  }

  const titresIdsDisplayed = ref<Record<number, TitreId>>({})

  const titresInit = (titres: TitreWithPoint[]) => {
    const { geojsons: geojsonLayer, markers: markersLayer } = layersBuild(titres, props.router)

    if (clusters.value.length !== 0) {
      const titreIdsToDisplay = titres.map(({ id }) => id)
      const titreIdsAlreadyDisplayed = clusters.value.flatMap<TitreId>(cluster => {
        return cluster.getLayers().map(layer => titresIdsDisplayed.value[cluster.getLayerId(layer)])
      })
      console.log('voyons', titreIdsToDisplay, titreIdsAlreadyDisplayed)
      // const { geojsons: geojsonLayer, markers: markersLayer } = layersBuild(titres.filter((({id}) => !titreIdsAlreadyDisplayed.includes(id))), props.router)

      clusters.value.forEach(cluster => {
        markersLayer.forEach(marker => {
          if (!titreIdsAlreadyDisplayed.includes(marker.id)) {
            if (marker.domaineId === cluster.caminoDomaineId) {
              cluster.addLayer(marker.marker)
              titresIdsDisplayed.value[cluster.getLayerId(marker.marker)] = marker.id
            }
          }
        })
      })
    } else {
      const clustersBuilt = clustersBuild()
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
    }
    geojsons.value = geojsonLayer
    markers.value = markersLayer

    geojsonLayersDisplay()
  }

  const titresPreferencesUpdate = async (params: { center?: [number, number]; zoom?: number; bbox?: [number, number, number, number] }) => {
    let ourParam = { ...savedParams.value }
    if (ourParam === null) {
      if (!params.center || !params.zoom || !params.bbox) {
        console.error('Les paramètres ne sont pas initialisés et ne sont pas tous là')
      } else {
        ourParam = { centre: params.center, zoom: params.zoom, perimetre: params.bbox }
      }
    } else {
      if (params.zoom) {
        ourParam.zoom = params.zoom
      }
      if (params.center) {
        ourParam.centre = params.center
      }

      if (params.bbox) {
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
    })
  }

  const mapCenter = (newZoneId: ZoneId) => {
    if (zoneId.value !== newZoneId) {
      zoneId.value = newZoneId
    }

    boundsFit()
  }

  const mapFrame = async () => {
    const currentRoute = props.router.currentRoute.value
    await props.router.push({ name: currentRoute.name ?? undefined, query: { ...currentRoute.query, perimetre: [-180, -90, 180, 90] } })

    if (map.value) {
      // TODO 2023-07-20 plus d'actualité ? On ne fait plus de allFit après chargement des données quand on veut tout afficher ?
      // le traitement au dessus peut-être très long et l’utilisateur a pu changer de page
      map.value.allFit()
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

  const markerLayersIdSet = (layerId: 'clusters' | 'markers' | 'none') => {
    if (matomo) {
      // @ts-ignore
      matomo.trackEvent('titres-vue', 'titre-id-fond-carte')
    }
    markerLayersId.value = layerId
    geojsonLayersDisplay()
  }

  onMounted(() => {
    init()
    // FIXME je pense que ça ne sert plus maintenant
    // window.addEventListener('popstate', popState)
  })
  // FIXME je pense que ça ne sert plus maintenant
  // onBeforeUnmount(() => {
  //   window.removeEventListener('popstate', popState)
  // })

  watch(
    () => props.titres,
    titres => {
      titresInit(titres)
    },
    { immediate: true }
  )
  return () => (
    <div class="dsfr" style={{ backgroundColor: 'var(--background-alt-blue-france)' }}>
      <CaminoMap ref={map} markerLayers={markerLayers.value} geojsonLayers={geojsonLayers.value} mapUpdate={titresPreferencesUpdate} class="map map-view mb-s" />

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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

        <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--sm fr-btns-group--center">
          <li>
            <DsfrButtonIcon
              icon="fr-icon-cloud-fill"
              buttonType={markerLayersId.value === 'clusters' ? 'primary' : 'secondary'}
              title="Groupe les marqueurs"
              onClick={() => markerLayersIdSet('clusters')}
            />
          </li>
          <li>
            <DsfrButtonIcon
              icon="fr-icon-map-pin-2-fill"
              buttonType={markerLayersId.value === 'markers' ? 'primary' : 'secondary'}
              title="Dégroupe les marqueurs"
              onClick={() => markerLayersIdSet('markers')}
            />
          </li>
          <li>
            <DsfrButtonIcon
              icon="fr-icon-map-pin-2-line"
              buttonType={markerLayersId.value === 'none' ? 'primary' : 'secondary'}
              title="Masque les marqueurs"
              onClick={() => markerLayersIdSet('none')}
            />
          </li>
        </ul>
      </div>
    </div>
  )
})
