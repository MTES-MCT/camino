import { FunctionalComponent, HTMLAttributes, defineComponent, onMounted, ref, Ref, computed } from 'vue'
import { FullscreenControl, Map, NavigationControl, StyleSpecification, LayerSpecification, LngLatBounds, SourceSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {z} from 'zod'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'


const contourLayerName = 'ContoursLine'
type Props = {geojsonMultiPolygon: FeatureMultiPolygon}

    const baseMapNames = {
      'OSM / fr': 'osm',
      'OSM / hot': 'hot',
      'Géoportail / Plan IGN': 'geoIGN',
      'Géoportail / Photographies aériennes': 'geoAer',
      'BRGM / Cartes géologiques 1/50 000': 'BRGMGeo',
    } as const satisfies Record<string, LayerId>

const layers = ['osm', 'hot', 'geoIGN', 'geoAer', 'BRGMGeo'] as const
const layerIdValidator = z.enum(layers)
type LayerId = z.infer<typeof layerIdValidator>

const sdomOverlayName = 'SDOM (schéma départemental d’orientation minière)'

//FIXME points
//FIXME plusieurs cartes sur la même page
//FIXME les titres voisins
//FIXME Pierre-Olivier souhaite que les points s’affichent à partir d’un niveau de zoom


const overlayLayers = ['SDOM', 'Facades', 'RedevanceArcheologiePreventive', contourLayerName, 'ContoursFill', 'ContoursPoints', 'ContoursPointLabels'] as const
const overlayLayerIdValidator = z.enum(overlayLayers)
type OverlayLayerId = z.infer<typeof overlayLayerIdValidator>

const overlayNames = [sdomOverlayName, 'Façades maritimes', 'Limite de la redevance d’archéologie préventive', 'Contours', 'Points'] as const
const overlayNameValidator = z.enum(overlayNames)
type OverlayName = z.infer<typeof overlayNameValidator>

const overlayMapNames = {
  [sdomOverlayName]: ['SDOM'],
  'Façades maritimes': ['Facades'],
  'Limite de la redevance d’archéologie préventive': ['RedevanceArcheologiePreventive'],
  Contours: [contourLayerName, 'ContoursFill'],
  Points: ['ContoursPoints', 'ContoursPointLabels'],
} as const satisfies Record<OverlayName, Readonly<OverlayLayerId[]>>

const layersSourceSpecifications: Record<LayerId, SourceSpecification> = {
  osm: {
    type: 'raster',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '&copy; Openstreetmap France | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxzoom: 19,
  },
  hot: {
    type: 'raster',
    tiles: ['https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'],
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap Team</a>',
    maxzoom: 19,
  },
  geoIGN: {
    type: 'raster',
    tiles: ['https://wxs.ign.fr/essentiels/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}'],
    maxzoom: 19,
    attribution: 'IGN-F/Geoportail',
  },
  geoAer: {
    type: 'raster',
    tiles: ['https://wxs.ign.fr/essentiels/geoportail/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'],
    maxzoom: 19,
    attribution: 'IGN-F/Geoportail',
  },
  BRGMGeo: {
    type: 'raster',
    tiles: ['https://geoservices.brgm.fr/geologie?service=WMS&request=GetMap&bbox={bbox-epsg-3857}&format=image/png&layers=SCAN_H_GEOL50&version=1.3.0&crs=EPSG:3857&dpiMode=7&transparent=false&width=256&height=256'],
    attribution: 'BRGM',
    maxzoom: 16
  },
}
const staticOverlayLayersSourceSpecification: Record<Exclude<OverlayLayerId, 'ContoursLine' | 'ContoursFill' | 'ContoursPoints' | 'ContoursPointLabels'>, SourceSpecification> = {SDOM: {
  type: 'raster',
  tiles: ['https://datacarto.geoguyane.fr/wms/SDOM_GUYANE?service=WMS&request=GetMap&layers=ZONE2activiteminiereautoriseesouscontrainte%2CZONE1activiteminiereinterditesaufexploitationsouterraineetrecherchesaeriennes%2CZONE0activiteminiereinterdite%2CZone0potentielle&styles=&format=image/png&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'],
  attribution: 'GéoGuyane'
},
Facades: {
  type: 'raster',
  tiles: ['https://gisdata.cerema.fr/arcgis/services/Carte_vocation_dsf_2020/MapServer/WMSServer?service=WMS&request=GetMap&layers=0&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}'],
  attribution: 'cerema'
},
RedevanceArcheologiePreventive: {
  type: 'raster',
  tiles: ['https://services.data.shom.fr/INSPIRE/wmts?layer=RAP_PYR_PNG_3857_WMTS&style=normal&tilematrixset=3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}'],
  attribution: 'shom'
}}


const overlayConfigs: Record<OverlayLayerId, LayerSpecification> = {
  Facades: {
    id: 'Facades',
    type: 'raster',
    source: 'Facades',
  },
  RedevanceArcheologiePreventive: {
    id: 'RedevanceArcheologiePreventive',
    type: 'raster',
    source: 'RedevanceArcheologiePreventive',
  },
  SDOM: {
    id: 'SDOM',
    type: 'raster',
    source: 'SDOM',
  },
  [contourLayerName]: {
  id: contourLayerName,
  type: 'line',
  source: 'Contours',

  paint: {
    "line-color": '#000091',
    "line-width": 2
  }
},

ContoursFill: {
  id: 'ContoursFill',
  type: 'fill',
  source: 'Contours',

  paint: {
    "fill-color": '#000091',
    "fill-opacity": 0.2
  }
},
ContoursPoints: {
  id: 'ContoursPoints',
  type: 'circle',
  source: 'Points',

  paint: {
    'circle-color': '#000091',
    "circle-radius": 10,
  }
},
ContoursPointLabels: {
  id: 'ContoursPointLabels',
  type: 'symbol',
  source: 'Points',
  layout: {
    // get the year from the source's "year" property
    'text-field': ['get', 'point'],
    'text-font': [
        'Open Sans Semibold',
        'Arial Unicode MS Bold'
    ],
    'text-offset': [0, 1.25],
    'text-anchor': 'top'
}

}}

export const DemarcheMap = defineComponent<Props>(props => {

  const layersControlVisible = ref<boolean>(false)
  const map = ref<Map | null>(null) as Ref<Map | null>


  const points = computed(() => {
    const currentPoints = []
    let index = 0
    props.geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
  topLevel.forEach((secondLevel, secondLevelIndex) =>
    secondLevel.forEach(([y, x], currentLevelIndex) => {
      // On ne rajoute pas le dernier point qui est égal au premier du contour...
      if (props.geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
        currentPoints.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [y, x]
          },
          properties: {
            point: index
          }

        })
        index++
      }
    })
  )
)

return {
  'type': 'FeatureCollection',
  'features': currentPoints}
}
)


  onMounted(() => {
    const style: StyleSpecification = {
      version: 8,
      "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
      sources: {
        ...layersSourceSpecifications,
        ...staticOverlayLayersSourceSpecification,
        Contours: {
          type: 'geojson',
          data: props.geojsonMultiPolygon,
        },
        Points: {
          type: 'geojson',
          data: points.value,
        }

      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
        overlayConfigs.ContoursFill,
        overlayConfigs.ContoursLine,
        overlayConfigs.ContoursPoints,
        overlayConfigs.ContoursPointLabels,
      ],
    }

    const mapLibre: Map = new Map({
      container: 'map',
      style,
      center: [2.2644635, 48.8588254],
      zoom: 6,
    })

    map.value = mapLibre

    mapLibre.addControl(new NavigationControl({ showCompass: false }), 'top-left')
    mapLibre.addControl(new FullscreenControl(), 'top-left')


    mapLibre.addControl(
      {
        onAdd: function () {
          const div = document.createElement('div')
          div.className = 'maplibregl-ctrl maplibregl-ctrl-group'
          div.innerHTML = `<button class="maplibregl-ctrl-icon" type="button" aria-label="Change le fond de carte" title="Change le fond de carte">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%" fill="currentColor">
          <path d="m24 41.5-18-14 2.5-1.85L24 37.7l15.5-12.05L42 27.5Zm0-7.6-18-14 18-14 18 14Zm0-15.05Zm0 11.25 13.1-10.2L24 9.7 10.9 19.9Z"/>
        </svg>
          </button>`
          div.onmouseenter = function () {
            layersControlVisible.value = true
          }
          return div
        },
        onRemove: function () {
          // TODO remove la div
        },
      },
      'top-right'
    )

    const bounds = new LngLatBounds()
    props.geojsonMultiPolygon.geometry.coordinates.forEach(top => {
      top.forEach(lowerLever => lowerLever.forEach(coordinates => bounds.extend(coordinates)))
    })

    mapLibre.fitBounds(bounds, { padding: 50 })
  })

  const selectLayer = (layer: LayerId) => {
    layers.forEach(l => {
      if (map.value?.getLayer(l)) {
        map.value?.removeLayer(l)
      }
    })

    map.value?.addLayer(
      {
        id: layer,
        type: 'raster',
        source: layer
      })

      overlayLayers.forEach(overlayLayer => {
        if (map.value?.getLayer(overlayLayer)) {
          map.value?.moveLayer(layer, overlayLayer)
        }
      })
  }


  const toggleOverlayLayer = (overlayLayers: Readonly<OverlayLayerId[]>) => {

    overlayLayers.forEach(overlayLayer => {
    if (map.value?.getLayer(overlayLayer)) {
      map.value?.removeLayer(overlayLayer)
    }else{
      map.value?.addLayer(overlayConfigs[overlayLayer])
    }

    map.value?.moveLayer(overlayLayer, contourLayerName)
  })

  }

  const layerControlOnMouseleave = () => {
    layersControlVisible.value = false
  }

  return () => <><div id="map" style={{minHeight: '400px'}}>
    <LayersControl
    style={{display: layersControlVisible.value ? 'block' : 'none', zIndex: 3}}
    onMouseleave={layerControlOnMouseleave}
    setLayer={selectLayer}
    toggleOverlayLayer={toggleOverlayLayer}
    />
    </div></>
})


const LayersControl: FunctionalComponent<{onMouseleave: HTMLAttributes['onMouseleave'], style: HTMLAttributes['style'], setLayer: (layer: LayerId) => void, toggleOverlayLayer: (overlay: Readonly<OverlayLayerId[]>) => void}> = (props) => {

  const selectLayer = (layer: LayerId) => {
    return () => props.setLayer(layer)
  }

  const toggleOverlayLayer = (overlayLayerName: OverlayName) => {
    return () => props.toggleOverlayLayer(overlayMapNames[overlayLayerName])
  }

  const defaultLayer = 'osm'
  const defaultOverlayLayer: OverlayName[] = ['Contours', 'Points']

  return <div class='maplibregl-ctrl-top-right'>
    <div class='maplibregl-ctrl maplibregl-ctrl-group fr-p-2w' style={{zIndex: 3}}>
        {
          Object.entries(baseMapNames).map(([name, layer]) => <div key={layer} class="fr-fieldset__element fr-mb-1v">
              <div class="fr-radio-group fr-radio-group--sm">
                  <input type="radio" id={`radio-hint-${layer}`} name="radio-layers" onClick={selectLayer(layer)} checked={layer === defaultLayer}/>
                  <label class="fr-label" for={`radio-hint-${layer}`}>
                      {name}
                  </label>
              </div>
          </div>)
        }
        <DsfrSeparator/>
        {
          overlayNames.map((name, index) => <div key={index} class="fr-fieldset__element fr-mb-1v">
              <div class="fr-checkbox-group fr-checkbox-group--sm">
                  <input type="checkbox" id={`checkbox-hint-${index}`} onClick={toggleOverlayLayer(name)} checked={defaultOverlayLayer.includes(name)}/>
                  <label class="fr-label" for={`checkbox-hint-${index}`}>
                      {name}
                  </label>
              </div>
          </div>)
        }
    </div>
  </div>
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheMap.props = ['geojsonMultiPolygon']
