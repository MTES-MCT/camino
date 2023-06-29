import { ref, computed, watch, onMounted, Ref } from 'vue'
import { CaminoMap } from '../_map/index'

import { leafletMarkerBuild, leafletGeojsonBuild, leafletDivIconBuild } from '../_map/leaflet'
import { getDomaineId, getTitreTypeType, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { GeoJsonObject } from 'geojson'
import { LatLngTuple, LayerGroup, layerGroup, Marker } from 'leaflet'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { titresGeoPolygon } from '@/api/titres'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { layersBuild, TitreWithPoint } from '@/components/titres/mapUtil'
import { useRouter } from 'vue-router'
import { ButtonIcon } from '../_ui/button-icon'

export interface Props {
  geojson: GeoJsonObject
  points?: { nom: string; coordonnees: { x: number; y: number } }[]
  titreTypeId: TitreTypeId
  isMain?: boolean
  titreId?: string
}

export const CaminoCommonMap = caminoDefineComponent<Props>(['geojson', 'points', 'titreTypeId', 'isMain', 'titreId'], props => {
  const map = ref<typeof CaminoMap | null>(null)
  const markersVisible = ref<boolean>(true)
  const patternVisible = ref<boolean>(true)

  const router = useRouter()

  const isMain = computed(() => props.isMain ?? false)

  const points = computed(() => props.points ?? [])

  const centrer = () => {
    map.value?.boundsFit(bounds.value)
  }

  const bounds = computed(() => {
    return geojsonLayers.value[0] ? geojsonLayers.value[0].getBounds() : [0, 0]
  })

  const geojsonLayers = computed(() => {
    const domaineId = getDomaineId(props.titreTypeId)
    const titreTypeTypeId = getTitreTypeType(props.titreTypeId)

    const className = patternVisible.value ? `svg-fill-pattern-${titreTypeTypeId}-${domaineId}` : `svg-fill-domaine-${domaineId}`

    const options = {
      style: { fillOpacity: 0.75, weight: 1, color: 'white', className },
    }

    const geojsonLayer = leafletGeojsonBuild(props.geojson, options)

    return [geojsonLayer]
  })

  const markerLayers = computed(() => {
    if (markersVisible.value) {
      return points.value.reduce<Marker<any>[]>((markers, point) => {
        if (!point.nom) {
          return markers
        }

        const icon = leafletDivIconBuild({
          className: `small mono border-bg color-text py-xs px-s inline-block leaflet-marker-camino cap pill bg-bg`,
          html: point.nom,
          iconSize: undefined,
          iconAnchor: [15.5, 38],
        })

        const latLng: LatLngTuple = [point.coordonnees.y, point.coordonnees.x]
        const titreMarker = leafletMarkerBuild(latLng, icon)

        markers.push(titreMarker)

        return markers
      }, [])
    }

    return []
  })

  watch(
    () => props.geojson,
    () => centrer(),
    { immediate: true }
  )
  watch(
    () => props.points,
    () => centrer(),
    { immediate: true }
  )
  onMounted(() => {
    centrer()
  })

  const mapUpdate = async (data: { center?: number[]; zoom?: number; bbox?: number[] }) => {
    const res: { elements: TitreWithPoint[] } = await titresGeoPolygon({
      statutsIds: [TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance],
      perimetre: data.bbox,
    })
    titresValidesGeojson.value.splice(0)
    titresValidesGeojson.value.push(...res.elements.filter(({ id }) => id !== props.titreId))
  }

  const titresValidesGeojson = ref<TitreWithPoint[]>([])
  const titresValidesLayer = ref<LayerGroup>(layerGroup([])) as Ref<LayerGroup>
  const additionalOverlayLayers = computed<Record<string, LayerGroup>>(() => {
    titresValidesLayer.value.clearLayers()

    const { geojsons, markers } = layersBuild(titresValidesGeojson.value, router)
    Object.values(geojsons).forEach(g => titresValidesLayer.value.addLayer(g))
    markers.forEach(q => q.marker.addTo(titresValidesLayer.value))

    return {
      'Titres valides': titresValidesLayer.value,
    }
  })

  return () => (
    <div class="bg-alt">
      <CaminoMap
        ref={map}
        mapUpdate={mapUpdate}
        geojsonLayers={geojsonLayers.value}
        markerLayers={markerLayers.value}
        additionalOverlayLayers={additionalOverlayLayers.value}
        class="map map-detail mb-s"
      />
      <div class={`${isMain.value ? 'container' : ''}`}>
        <div class="tablet-blobs">
          <div class={`${!isMain.value ? 'px-s' : ''} tablet-blob-1-2`}>
            <div class="flex mb-s">
              <button class="btn-border pill px-m py-s" onClick={() => centrer()}>
                Centrer
              </button>
            </div>
          </div>
          <div class="desktop-blob-1-2 desktop-flex">
            <div class={`${markersVisible.value ? 'active' : ''} mb-s mr-xs`}>
              <ButtonIcon
                class="btn-border p-s rnd-s"
                title={`${markersVisible.value ? 'Masque' : 'Affiche'} les marqueurs`}
                onClick={() => (markersVisible.value = !markersVisible.value)}
                icon="marker-ungrouped"
              />
            </div>

            <div class={`${patternVisible.value ? 'active' : ''} mb-s mr-xs`}>
              <ButtonIcon
                class="btn-border p-s rnd-s"
                title={`${patternVisible.value ? 'Masque' : 'Affiche'} la trame`}
                onClick={() => (patternVisible.value = !patternVisible.value)}
                icon="pattern"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
