<template>
  <div ref="map"></div>
</template>

<script setup lang="ts">
import type {
  LatLngBoundsExpression,
  LatLngExpression,
  Map,
  Layer,
  LayersControlEvent,
  LeafletEvent
} from 'leaflet'

import { ref, onMounted, markRaw, watch } from 'vue'
import { FeatureGroup, layerGroup } from 'leaflet'

const map = ref<HTMLDivElement | null>(null)
const leafletComponent = ref<Map | null>(null)
const updateBboxOnly = ref<boolean>(false)
const updateCenterAndZoomOnly = ref<boolean>(false)
const zoom = ref<number>(8)

const props = defineProps<{ geojsonLayers: Layer[]; markerLayers: Layer[] }>()
const sdomOverlayName = 'SDOM (schéma départemental d’orientation minière)'
const brgmBaseLayerName = 'BRGM / Cartes géologiques 1/50 000'

const geojsonLayer = layerGroup([])
const markerLayer = layerGroup([])

watch(
  () => props.geojsonLayers,
  (layers: Layer[]) => {
    geojsonLayer.clearLayers()
    layers.forEach(l => l.addTo(geojsonLayer))
  },
  { immediate: true }
)
watch(
  () => props.markerLayers,
  (layers: Layer[]) => {
    markerLayer.clearLayers()
    layers.forEach(l => l.addTo(markerLayer))
  },
  { immediate: true }
)

const emits = defineEmits<{
  (
    e: 'map-update',
    payload: { center?: number[]; zoom?: number; bbox?: number[] }
  ): void
}>()

const boundsGet = () => {
  if (leafletComponent.value !== null) {
    const bounds = leafletComponent.value.getBounds()

    return [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat
    ]
  }
  return []
}

function boundsFit(bounds: LatLngBoundsExpression) {
  leafletComponent.value?.fitBounds(bounds)
}

const positionSet = (position: { zoom: number; center: LatLngExpression }) => {
  updateBboxOnly.value = true

  zoom.value = position.zoom
  leafletComponent.value?.setView(position.center, position.zoom)
}

const allFit = () => {
  const featureGroup = new FeatureGroup(markerLayer.getLayers())
  updateCenterAndZoomOnly.value = true
  boundsFit(featureGroup.getBounds())
}
defineExpose({ boundsFit, positionSet, allFit })

const sdomLegends = [
  { icon: 'icon-map-legend-sdom-zone-0', label: 'Zone 0' },
  {
    icon: 'icon-map-legend-sdom-zone-0-potentielle',
    label: 'Zone 0 potentielle'
  },
  { icon: 'icon-map-legend-sdom-zone-1', label: 'Zone 1' },
  { icon: 'icon-map-legend-sdom-zone-2', label: 'Zone 2' }
]

onMounted(() => {
  const L = window.L

  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  )
  const hot = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>'
    }
  )
  const geoIGN = L.tileLayer(
    'https://wxs.ign.fr/essentiels/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
    {
      maxZoom: 19,
      attribution: 'IGN-F/Geoportail'
    }
  )
  const geoAer = L.tileLayer(
    'https://wxs.ign.fr/essentiels/geoportail/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    {
      maxZoom: 19,
      attribution: 'IGN-F/Geoportail'
    }
  )
  const geoCadastre = L.tileLayer(
    'https://wxs.ign.fr/essentiels/geoportail/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    {
      maxZoom: 19,
      attribution: 'IGN-F/Geoportail'
    }
  )

  const BRGMGeo = L.tileLayer.wms('https://geoservices.brgm.fr/geologie', {
    layers: 'SCAN_H_GEOL50',
    format: 'image/png',
    attribution: 'BRGM',
    version: '1.3.0'
  })

  const baseMaps = {
    'OSM / fr': osm,
    'OSM / hot': hot,
    'Géoportail / Plan IGN': geoIGN,
    'Géoportail / Photographies aériennes': geoAer,
    'Géoportail / Parcelles cadastrales': geoCadastre,
    [brgmBaseLayerName]: BRGMGeo
  }

  const SDOM = L.tileLayer.wms(
    'https://datacarto.geoguyane.fr/wms/SDOM_GUYANE',
    {
      layers:
        'ZONE2activiteminiereautoriseesouscontrainte,ZONE1activiteminiereinterditesaufexploitationsouterraineetrecherchesaeriennes,ZONE0activiteminiereinterdite,Zone0potentielle',
      format: 'image/png',
      attribution: 'GéoGuyane'
    }
  )

  const Facades = L.tileLayer.wms(
    'https://gisdata.cerema.fr/arcgis/services/Carte_vocation_dsf_2020/MapServer/WMSServer',
    {
      layers: '0',
      format: 'image/png',
      transparent: true,
      attribution: 'cerema'
    }
  )
  const RedevanceArcheologiePreventive = L.tileLayer(
    'https://services.data.shom.fr/INSPIRE/wmts?layer=RAP_PYR_PNG_3857_WMTS&style=normal&tilematrixset=3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}',
    {
      attribution: 'shom'
    }
  )
  const overlayMaps = {
    [sdomOverlayName]: SDOM,
    'Façades maritimes': Facades,
    'Limite de la redevance d’archéologie préventive':
      RedevanceArcheologiePreventive,
    Contours: geojsonLayer,
    Points: markerLayer
  }
  if (map.value !== null) {
    const leafletComponentOnMounted = markRaw(
      L.map(map.value, {
        zoomControl: true,
        zoomAnimation: false,
        doubleClickZoom: false,
        minZoom: 1,
        // @ts-ignore
        gestureHandling: true,
        fullscreenControl: {
          pseudoFullscreen: true
        },
        layers: [osm, geojsonLayer, markerLayer]
      })
    )
    leafletComponent.value = leafletComponentOnMounted

    L.control.layers(baseMaps, overlayMaps).addTo(leafletComponentOnMounted)

    leafletComponentOnMounted.on('moveend', () => {
      if (updateBboxOnly.value) {
        updateBboxOnly.value = false
        const bbox = boundsGet()

        emits('map-update', { bbox })
      } else {
        const center = [
          leafletComponentOnMounted.getCenter().lat,
          leafletComponentOnMounted.getCenter().lng
        ]
        const leafletZoom = leafletComponentOnMounted.getZoom()
        zoom.value = leafletZoom

        if (updateCenterAndZoomOnly.value) {
          updateCenterAndZoomOnly.value = false
          emits('map-update', { center, zoom: zoom.value })
        } else {
          const bbox = boundsGet()

          emits('map-update', { center, zoom: zoom.value, bbox })
        }
      }
    })

    // TODO 2022-11-07 add gesture handling typing
    leafletComponentOnMounted.on('fullscreenchange', () => {
      // @ts-ignore
      if (leafletComponentOnMounted.isFullscreen()) {
        // @ts-ignore
        leafletComponentOnMounted.gestureHandling.disable()
      } else {
        // @ts-ignore
        leafletComponentOnMounted.gestureHandling.enable()
      }
    })

    zoom.value = leafletComponentOnMounted.getZoom()

    L.control.scale({ imperial: false }).addTo(leafletComponentOnMounted)
    const ZoomViewer = L.Control.extend({
      onAdd() {
        const gauge = L.DomUtil.create('div')
        gauge.style.width = '70px'
        gauge.style.background = 'rgba(255,255,255,0.5)'
        gauge.style.textAlign = 'left'
        leafletComponentOnMounted.on(
          'zoomstart zoom zoomend zoomlevelschange load viewreset',
          () => {
            gauge.innerHTML = `Zoom: ${zoom.value}`
          }
        )
        return gauge
      }
    })

    new ZoomViewer().addTo(leafletComponentOnMounted)
    const SdomLegend = L.Control.extend({
      onAdd() {
        const legend = L.DomUtil.create('div')
        legend.style.background = 'rgba(255,255,255,0.7)'
        legend.className = 'mt-xs'

        sdomLegends.forEach(sdom => {
          const ligne = L.DomUtil.create('div')
          const icone = L.DomUtil.create('i')
          ligne.className = 'flex flex-center mb-xs'
          icone.className = `icon-map-legend ${sdom.icon}`
          ligne.appendChild(icone)
          ligne.append(`: ${sdom.label}`)
          legend.appendChild(ligne)
        })
        leafletComponentOnMounted.on('overlayadd overlayremove', layer => {
          if (isLayersControlEvent(layer)) {
            if (layer.type === 'overlayadd' && layer.name === sdomOverlayName) {
              legend.style.display = 'block'
            }
            if (
              layer.type === 'overlayremove' &&
              layer.name === sdomOverlayName
            ) {
              legend.style.display = 'none'
            }
          }
        })
        legend.style.display = 'none'
        return legend
      }
    })
    new SdomLegend({ position: 'topright' }).addTo(leafletComponentOnMounted)

    const BRGMLegend = L.Control.extend({
      onAdd() {
        const legend = L.DomUtil.create('div')
        legend.className = 'bg-warning px py-s color-bg mb-s h6 bold'
        legend.innerHTML =
          'Fond de carte visible <br /> aux niveaux de zoom 12 à 16 en métropole'
        leafletComponentOnMounted.on('baselayerchange', layer => {
          if (isLayersControlEvent(layer)) {
            if (layer.name === brgmBaseLayerName) {
              legend.style.display = 'block'
            } else {
              legend.style.display = 'none'
            }
          }
        })
        legend.style.display = 'none'
        return legend
      }
    })
    new BRGMLegend({ position: 'topright' }).addTo(leafletComponentOnMounted)
  } else {
    console.error('Cas impossible ?')
  }
})
const isLayersControlEvent = (
  layer: LeafletEvent
): layer is LayersControlEvent => 'type' in layer && 'name' in layer
</script>
