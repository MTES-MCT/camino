import { FunctionalComponent, HTMLAttributes, defineComponent, onMounted, ref, Ref, computed, watch, onBeforeUnmount } from 'vue'
import { FullscreenControl, Map, NavigationControl, StyleSpecification, LayerSpecification, LngLatBounds, SourceSpecification, Popup, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { z } from 'zod'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { FeatureMultiPolygon } from 'camino-common/src/demarche'
import { random } from '@/utils/vue-tsx-utils'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TitreSlug } from 'camino-common/src/titres'
import { TitreApiClient } from '../titre/titre-api-client'
import { TitreWithPoint } from '../titres/mapUtil'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { couleurParDomaine } from '../_common/domaine'
import { getDomaineId } from 'camino-common/src/static/titresTypes'
import { Router } from 'vue-router'

const contoursSourceName = 'Contours'
const pointsSourceName = 'Points'
const contoursLineName = 'ContoursLine'
const contourPointsName = 'ContoursPoints'
const titresValidesFillName = 'TitresValidesFill'
const titresValidesLineName = 'TitresValidesLine'

type Props = {
  geojsonMultiPolygon: FeatureMultiPolygon
  maxMarkers: number
  style?: HTMLAttributes['style']
  class?: HTMLAttributes['class']
  neighbours: {
    apiClient: Pick<TitreApiClient, 'getTitresWithPerimetreForCarte'>
    titreSlug: TitreSlug
  } | null
  router: Pick<Router, 'push'>
}

type TitreValideProperties = Pick<TitreWithPoint, 'nom' | 'slug' | 'typeId' | 'titreStatutId'> & { domaineColor: string }

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

const overlayLayers = [
  'SDOM',
  'Facades',
  'RedevanceArcheologiePreventive',
  titresValidesFillName,
  titresValidesLineName,
  'ContoursFill',
  contoursLineName,
  contourPointsName,
  'ContoursPointLabels',
] as const
const overlayLayerIdValidator = z.enum(overlayLayers)
type OverlayLayerId = z.infer<typeof overlayLayerIdValidator>

const overlayNames = [sdomOverlayName, 'Façades maritimes', 'Limite de la redevance d’archéologie préventive', contoursSourceName, pointsSourceName, 'Titres valides'] as const
const overlayNameValidator = z.enum(overlayNames)
type OverlayName = z.infer<typeof overlayNameValidator>

const overlayMapNames = {
  [sdomOverlayName]: ['SDOM'],
  'Façades maritimes': ['Facades'],
  'Limite de la redevance d’archéologie préventive': ['RedevanceArcheologiePreventive'],
  [contoursSourceName]: [contoursLineName, 'ContoursFill'],
  [pointsSourceName]: [contourPointsName, 'ContoursPointLabels'],
  'Titres valides': [titresValidesLineName, titresValidesFillName],
} as const satisfies Record<OverlayName, Readonly<OverlayLayerId[]>>

const layersSourceSpecifications: Record<LayerId, SourceSpecification> = {
  osm: {
    type: 'raster',
    tiles: ['https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'],
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
    tiles: [
      'https://wxs.ign.fr/essentiels/geoportail/wmts?layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
    ],
    maxzoom: 19,
    attribution: 'IGN-F/Geoportail',
  },
  geoAer: {
    type: 'raster',
    tiles: [
      'https://wxs.ign.fr/essentiels/geoportail/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
    ],
    maxzoom: 19,
    attribution: 'IGN-F/Geoportail',
  },
  BRGMGeo: {
    type: 'raster',
    tiles: [
      'https://geoservices.brgm.fr/geologie?service=WMS&request=GetMap&bbox={bbox-epsg-3857}&format=image/png&layers=SCAN_H_GEOL50&version=1.3.0&crs=EPSG:3857&dpiMode=7&transparent=false&width=256&height=256',
    ],
    attribution: 'BRGM',
    maxzoom: 16,
  },
}
const staticOverlayLayersSourceSpecification: Record<
  Exclude<OverlayLayerId, 'ContoursLine' | 'ContoursFill' | 'ContoursPoints' | 'ContoursPointLabels' | 'TitresValidesLine' | 'TitresValidesFill'>,
  SourceSpecification
> = {
  SDOM: {
    type: 'raster',
    tiles: [
      'https://datacarto.geoguyane.fr/wms/SDOM_GUYANE?service=WMS&request=GetMap&layers=ZONE2activiteminiereautoriseesouscontrainte%2CZONE1activiteminiereinterditesaufexploitationsouterraineetrecherchesaeriennes%2CZONE0activiteminiereinterdite%2CZone0potentielle&styles=&format=image/png&transparent=false&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}',
    ],
    attribution: 'GéoGuyane',
  },
  Facades: {
    type: 'raster',
    tiles: [
      'https://gisdata.cerema.fr/arcgis/services/Carte_vocation_dsf_2020/MapServer/WMSServer?service=WMS&request=GetMap&layers=0&styles=&format=image/png&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG:3857&bbox={bbox-epsg-3857}',
    ],
    attribution: 'cerema',
  },
  RedevanceArcheologiePreventive: {
    type: 'raster',
    tiles: [
      'https://services.data.shom.fr/INSPIRE/wmts?layer=RAP_PYR_PNG_3857_WMTS&style=normal&tilematrixset=3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}',
    ],
    attribution: 'shom',
  },
}

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
  [contoursLineName]: {
    id: contoursLineName,
    type: 'line',
    source: contoursSourceName,

    paint: {
      'line-color': '#000091',
      'line-width': 2,
    },
  },

  ContoursFill: {
    id: 'ContoursFill',
    type: 'fill',
    source: contoursSourceName,

    paint: {
      'fill-color': '#000091',
      'fill-opacity': 0.2,
    },
  },
  [contourPointsName]: {
    id: contourPointsName,
    type: 'circle',
    source: pointsSourceName,
    minzoom: 12,

    paint: {
      'circle-color': '#000091',
      'circle-radius': 16,
    },
  },
  ContoursPointLabels: {
    id: 'ContoursPointLabels',
    type: 'symbol',
    source: pointsSourceName,
    minzoom: 12,
    paint: {
      'text-color': '#ffffff',
    },
    layout: {
      'text-field': ['get', 'pointNumber'],
      'text-allow-overlap': false,
    },
  },
  [titresValidesLineName]: {
    id: titresValidesLineName,
    type: 'line',
    source: 'TitresValides',

    paint: {
      'line-color': '#000000',
      'line-width': 1,
    },
  },
  [titresValidesFillName]: {
    id: titresValidesFillName,
    type: 'fill',
    source: 'TitresValides',

    paint: {
      'fill-color': ['get', 'domaineColor'],
      'fill-opacity': 0.7,
    },
  },
}

export const DemarcheMap = defineComponent<Props>(props => {
  const mapRef = ref<HTMLDivElement | null>(null)
  const layersControlVisible = ref<boolean>(false)
  const map = ref<Map | null>(null) as Ref<Map | null>

  const defaultOverlayLayer = computed<Extract<OverlayName, 'Contours' | 'Points' | 'Titres valides'>[]>(() => {
    const values: Extract<OverlayName, 'Contours' | 'Points' | 'Titres valides'>[] = []
    if (props.neighbours !== null) {
      values.push('Titres valides')
    }
    values.push('Contours')
    if (props.maxMarkers > points.value.features.length) {
      values.push('Points')
    }

    return values
  })

  const points = computed<{
    type: 'FeatureCollection'
    features: { type: 'Feature'; geometry: { type: 'Point'; coordinates: [number, number] }; properties: { pointNumber: string; latitude: string; longitude: string } }[]
  }>(() => {
    const currentPoints: { type: 'Feature'; geometry: { type: 'Point'; coordinates: [number, number] }; properties: { pointNumber: string; latitude: string; longitude: string } }[] = []
    let index = 0
    props.geojsonMultiPolygon.geometry.coordinates.forEach((topLevel, topLevelIndex) =>
      topLevel.forEach((secondLevel, secondLevelIndex) =>
        secondLevel.forEach(([x, y], currentLevelIndex) => {
          // On ne rajoute pas le dernier point qui est égal au premier du contour...
          if (props.geojsonMultiPolygon.geometry.coordinates[topLevelIndex][secondLevelIndex].length !== currentLevelIndex + 1) {
            currentPoints.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [x, y],
              },
              properties: {
                pointNumber: `${index}`,
                latitude: `${y}`,
                longitude: `${x}`,
              },
            })
            index++
          }
        })
      )
    )

    return {
      type: 'FeatureCollection',
      features: currentPoints,
    }
  })

  watch(
    () => props.geojsonMultiPolygon,
    () => {
      const bounds = new LngLatBounds()
      props.geojsonMultiPolygon.geometry.coordinates.forEach(top => {
        top.forEach(lowerLever => lowerLever.forEach(coordinates => bounds.extend(coordinates)))
      })
      ;(map.value?.getSource(contoursSourceName) as GeoJSONSource).setData(props.geojsonMultiPolygon)
      ;(map.value?.getSource(pointsSourceName) as GeoJSONSource).setData(points.value)

      map.value?.fitBounds(bounds, { padding: 50 })
    }
  )

  const moveend = async () => {
    if (props.neighbours !== null && isNotNullNorUndefined(map.value)) {
      const bounds = map.value.getBounds()

      try {
        const res: { elements: TitreWithPoint[] } = await props.neighbours.apiClient.getTitresWithPerimetreForCarte({
          statutsIds: [TitresStatutIds.Valide, TitresStatutIds.ModificationEnInstance, TitresStatutIds.SurvieProvisoire],
          perimetre: [...bounds.getNorthWest().toArray(), ...bounds.getSouthEast().toArray()],
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

        ;(map.value?.getSource('TitresValides') as GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: res.elements
            .filter(({ slug }) => slug !== props.neighbours?.titreSlug)
            .filter(titreValide => isNotNullNorUndefined(titreValide.geojsonMultiPolygon))
            .map(titreValide => {
              const properties: TitreValideProperties = {
                slug: titreValide.slug,
                nom: titreValide.nom,
                typeId: titreValide.typeId,
                titreStatutId: titreValide.titreStatutId,
                domaineColor: couleurParDomaine[getDomaineId(titreValide.typeId)],
              }

              // TODO 2023-12-04 un jour on espère pouvoir virer le ! parce que le filter l'empêche
              return { ...titreValide.geojsonMultiPolygon!, properties }
            }),
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  onMounted(() => {
    const bounds = new LngLatBounds()
    props.geojsonMultiPolygon.geometry.coordinates.forEach(top => {
      top.forEach(lowerLever => lowerLever.forEach(coordinates => bounds.extend(coordinates)))
    })

    const style: StyleSpecification = {
      version: 8,
      glyphs: 'https://etalab-tiles.fr/fonts/{fontstack}/{range}.pbf',
      sources: {
        ...layersSourceSpecifications,
        ...staticOverlayLayersSourceSpecification,
        [contoursSourceName]: {
          type: 'geojson',
          data: props.geojsonMultiPolygon,
        },
        [pointsSourceName]: {
          type: 'geojson',
          data: points.value,
        },
        TitresValides: {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
        ...defaultOverlayLayer.value.flatMap(overlay => overlayMapNames[overlay].map(o => overlayConfigs[o])),
      ],
    }

    if (mapRef.value === null) {
      console.error("la carte ne peut pas être chargée à cause d'un problème technique, contactez l'équipe Camion")
    } else {
      const mapLibre: Map = new Map({
        container: mapRef.value,
        style,
        center: bounds.getCenter().toArray(),
        zoom: 16,
      })

      map.value = mapLibre

      mapLibre.addControl(new NavigationControl({ showCompass: false }), 'top-left')
      mapLibre.addControl(new FullscreenControl(), 'top-left')

      const layersControlId = `layers-control-${random()}`
      mapLibre.addControl(
        {
          onAdd: function () {
            const div = document.createElement('div')
            div.id = layersControlId
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
            const div = document.getElementById(layersControlId)
            if (div !== null) {
              document.removeChild(div)
            }
          },
        },
        'top-right'
      )

      mapLibre.fitBounds(bounds, { padding: 50 })

      mapLibre.on('moveend', moveend)

      mapLibre.on('click', contourPointsName, e => {
        if (isNotNullNorUndefinedNorEmpty(e.features)) {
          new Popup({ closeButton: false, maxWidth: '500' })
            .setLngLat(e.lngLat)
            .setHTML(`<div class="fr-text--md fr-m-0"><div>Latitude : <b>${e.features[0].properties.latitude}</b></div><div>Longitude : <b>${e.features[0].properties.longitude}</b></div></div>`)
            .addTo(mapLibre)
        }
      })

      const popup = new Popup({
        closeButton: false,
        maxWidth: '500',
      })

      mapLibre.on('mouseenter', titresValidesFillName, e => {
        if (isNotNullNorUndefinedNorEmpty(e.features)) {
          const titreProperties = e.features[0].properties as TitreValideProperties

          popup.setLngLat(e.lngLat).setHTML(`<div class="fr-text--lg fr-m-0">${titreProperties.nom}</div>`).addTo(mapLibre)
        }
      })

      mapLibre.on('mouseleave', titresValidesFillName, () => {
        popup.remove()
      })

      mapLibre.on('click', titresValidesFillName, e => {
        if (isNotNullNorUndefinedNorEmpty(e.features)) {
          const titreProperties = e.features[0].properties as TitreValideProperties
          props.router.push({ name: 'titre', params: { id: titreProperties.slug } })
        }
      })
    }
  })

  onBeforeUnmount(() => {
    map.value?.off('moveend', moveend)
  })

  const selectLayer = (layer: LayerId) => {
    layers.forEach(l => {
      if (map.value?.getLayer(l)) {
        map.value?.removeLayer(l)
      }
    })

    map.value?.addLayer({
      id: layer,
      type: 'raster',
      source: layer,
    })

    overlayLayers.forEach(overlayLayer => {
      if (map.value?.getLayer(overlayLayer)) {
        map.value?.moveLayer(overlayLayer)
      }
    })
  }

  const toggleOverlayLayer = (overlayLayersToToggle: Readonly<OverlayLayerId[]>) => {
    overlayLayersToToggle.forEach(overlayLayer => {
      if (map.value?.getLayer(overlayLayer)) {
        map.value?.removeLayer(overlayLayer)
      } else {
        map.value?.addLayer(overlayConfigs[overlayLayer])
      }
    })

    overlayLayers.forEach(overlayLayer => {
      if (map.value?.getLayer(overlayLayer)) {
        map.value?.moveLayer(overlayLayer)
      }
    })
  }

  const layerControlOnMouseleave = () => {
    layersControlVisible.value = false
  }

  const id = `${random()}`

  return () => (
    <div ref={mapRef} class={props.class} style={{ minHeight: '400px' }}>
      <LayersControl
        id={id}
        style={{ display: layersControlVisible.value ? 'block' : 'none', zIndex: 3 }}
        onMouseleave={layerControlOnMouseleave}
        setLayer={selectLayer}
        toggleOverlayLayer={toggleOverlayLayer}
        defaultOverlayLayer={defaultOverlayLayer.value}
        overlays={overlayNames.filter(name => props.neighbours !== null || name !== 'Titres valides')}
      />
    </div>
  )
})

const LayersControl: FunctionalComponent<{
  id: string
  onMouseleave: HTMLAttributes['onMouseleave']
  style: HTMLAttributes['style']
  setLayer: (layer: LayerId) => void
  toggleOverlayLayer: (overlay: Readonly<OverlayLayerId[]>) => void
  defaultOverlayLayer: OverlayName[]
  overlays: OverlayName[]
}> = props => {
  const selectLayer = (layer: LayerId) => {
    return () => props.setLayer(layer)
  }

  const toggleOverlayLayer = (overlayLayerName: OverlayName) => {
    return () => props.toggleOverlayLayer(overlayMapNames[overlayLayerName])
  }

  const defaultLayer = 'osm'

  return (
    <div class="maplibregl-ctrl-top-right" id={props.id}>
      <div class="maplibregl-ctrl maplibregl-ctrl-group fr-p-2w" style={{ zIndex: 3 }}>
        {Object.entries(baseMapNames).map(([name, layer]) => (
          <div key={`${layer}-${props.id}`} class="fr-fieldset__element fr-mb-1v">
            <div class="fr-radio-group fr-radio-group--sm">
              <input type="radio" id={`radio-hint-${layer}-${props.id}`} name={`radio-layers-${props.id}`} onClick={selectLayer(layer)} checked={layer === defaultLayer} />
              <label class="fr-label" for={`radio-hint-${layer}-${props.id}`}>
                {name}
              </label>
            </div>
          </div>
        ))}
        <DsfrSeparator />
        {props.overlays.map((name, index) => (
          <div key={index} class="fr-fieldset__element fr-mb-1v">
            <div class="fr-checkbox-group fr-checkbox-group--sm">
              <input type="checkbox" id={`checkbox-hint-${index}-${props.id}`} onClick={toggleOverlayLayer(name)} checked={props.defaultOverlayLayer.includes(name)} />
              <label class="fr-label" for={`checkbox-hint-${index}-${props.id}`}>
                {name}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheMap.props = ['geojsonMultiPolygon', 'class', 'style', 'maxMarkers', 'neighbours', 'router']
