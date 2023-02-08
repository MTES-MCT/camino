import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { CaminoMap } from '../_map/index'

import {
  leafletMarkerBuild,
  leafletGeojsonBuild,
  leafletDivIconBuild
} from '../_map/leaflet'
import { Icon } from '@/components/_ui/icon'
import {
  getDomaineId,
  getTitreTypeType,
  TitreTypeId
} from 'camino-common/src/static/titresTypes'
import { GeoJsonObject } from 'geojson'
import { useRoute } from 'vue-router'
import { LatLngTuple, Marker } from 'leaflet'

export interface Props {
  geojson: GeoJsonObject
  points?: { nom: string; coordonnees: { x: number; y: number } }[]
  titreTypeId: TitreTypeId
  isMain?: boolean
}

export const CamionCommonMap = defineComponent<Props>({
  props: ['geojson', 'points', 'titreTypeId', 'isMain'] as unknown as undefined,
  setup(props) {
    const map = ref<typeof CaminoMap | null>(null)
    const markersVisible = ref<boolean>(true)
    const patternVisible = ref<boolean>(true)

    const isMain = computed(() => props.isMain ?? false)

    const points = computed(() => props.points ?? [])

    const route = useRoute()

    const centrer = () => {
      map.value?.boundsFit(bounds.value)
    }

    const bounds = computed(() => {
      return geojsonLayers.value[0]
        ? geojsonLayers.value[0].getBounds()
        : [0, 0]
    })

    const geojsonLayers = computed(() => {
      const domaineId = getDomaineId(props.titreTypeId)
      const titreTypeTypeId = getTitreTypeType(props.titreTypeId)

      const className = patternVisible.value
        ? `svg-fill-pattern-${titreTypeTypeId}-${domaineId}`
        : `svg-fill-domaine-${domaineId}`

      const options = {
        style: { fillOpacity: 0.75, weight: 1, color: 'white', className }
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
            iconAnchor: [15.5, 38]
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

    return () => (
      <div class="bg-alt">
        <CaminoMap
          ref={map}
          geojsonLayers={geojsonLayers.value}
          markerLayers={markerLayers.value}
          class="map map-detail mb-s"
        />
        <div class={`${isMain.value ? 'container' : ''}`}>
          <div class="tablet-blobs">
            <div class={`${!isMain.value ? 'px-s' : ''} tablet-blob-1-2`}>
              <div class="flex mb-s">
                <button
                  class="btn-border pill px-m py-s"
                  onClick={() => centrer()}
                >
                  Centrer
                </button>
              </div>
            </div>
            <div class="desktop-blob-1-2 desktop-flex">
              <div class={`${markersVisible.value ? 'active' : ''} mb-s mr-xs`}>
                <button
                  class="btn-border p-s rnd-s"
                  title="affiche / masque les marqueurs"
                  onClick={() => (markersVisible.value = !markersVisible.value)}
                >
                  <Icon size="M" name="marker-ungrouped" />
                </button>
              </div>

              <div class={`${patternVisible.value ? 'active' : ''} mb-s mr-xs`}>
                <button
                  class="btn-border p-s rnd-s"
                  title="affiche / masque la trame"
                  onClick={() => (patternVisible.value = !patternVisible.value)}
                >
                  <Icon size="M" name="pattern" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
