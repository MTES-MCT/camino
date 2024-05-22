import { HTMLAttributes, defineComponent, onMounted, ref, Ref, computed, watch, onUnmounted, DeepReadonly } from 'vue'
import { FullscreenControl, Map, NavigationControl, StyleSpecification, LayerSpecification, LngLatBounds, SourceSpecification, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { FeatureCollectionForages, FeatureCollectionPoints, FeatureMultiPolygon, ForageType, featureForagePropertiesValidator } from 'camino-common/src/perimetre'
import { random } from '@/utils/vue-tsx-utils'
import { TitresStatutIds } from 'camino-common/src/static/titresStatuts'
import { TitreSlug } from 'camino-common/src/validators/titres'
import { TitreApiClient } from '../titre/titre-api-client'
import { TitreWithPerimetre } from '../titres/mapUtil'
import { isNotNullNorUndefined, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { couleurParDomaine } from '../_common/domaine'
import { TitreTypeId, getDomaineId } from 'camino-common/src/static/titresTypes'
import { Router } from 'vue-router'
import { canHaveForages } from 'camino-common/src/permissions/titres'
import { capitalize } from 'camino-common/src/strings'
import { CaminoLngLatBounds, CaminoMapLibre, CaminoStyleSpecification } from '@/typings/maplibre-gl'
import {
  LayerId,
  LayersControl,
  OverlayLayerId,
  OverlayName,
  contourForagesLabel,
  contourForagesName,
  contourPointsName,
  contoursLineName,
  contoursSourceName,
  foragesSourceName,
  layers,
  overlayLayers,
  overlayMapNames,
  overlayNames,
  pointsSourceName,
  titresValidesFillName,
  titresValidesLineName,
} from './demarche-map-layer-controls'

type Props = {
  perimetre: DeepReadonly<{ geojson4326_perimetre: FeatureMultiPolygon; geojson4326_points: FeatureCollectionPoints; geojson4326_forages: FeatureCollectionForages | null }>
  maxMarkers: number
  style?: HTMLAttributes['style']
  class?: HTMLAttributes['class']
  titreTypeId: TitreTypeId
  neighbours: {
    apiClient: Pick<TitreApiClient, 'getTitresWithPerimetreForCarte'>
    titreSlug: TitreSlug
    router: Pick<Router, 'push'>
  } | null
}

type TitreValideProperties = Pick<TitreWithPerimetre, 'nom' | 'slug' | 'typeId' | 'titreStatutId'> & { domaineColor: string }

const layersSourceSpecifications: Record<LayerId, SourceSpecification> = {
  osm: {
    type: 'raster',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '&copy; Openstreetmap | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
  Exclude<OverlayLayerId, 'ContoursLine' | 'ContoursFill' | 'ContoursPoints' | 'ContoursPointLabels' | 'TitresValidesLine' | 'TitresValidesFill' | 'ContoursForages' | 'ContoursForagesLabel'>,
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
    paint: {
      'circle-color': '#000091',
      'circle-radius': 16,
    },
  },
  ContoursPointLabels: {
    id: 'ContoursPointLabels',
    type: 'symbol',
    source: pointsSourceName,
    paint: {
      'text-color': '#ffffff',
    },
    layout: {
      'text-field': ['get', 'nom'],
      'text-allow-overlap': false,
    },
  },
  [contourForagesName]: {
    id: contourForagesName,
    type: 'circle',
    source: foragesSourceName,
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': 4,
    },
  },
  [contourForagesLabel]: {
    id: contourForagesLabel,
    type: 'symbol',
    source: foragesSourceName,
    paint: {
      'text-color': '#000000',
      'text-halo-color': '#fff',
      'text-halo-width': 2,
    },
    layout: {
      'text-size': 12,
      'text-field': ['get', 'nom'],
      'text-overlap': 'never',
      'symbol-sort-key': ['get', 'index'],
      'text-offset': [0, 1],
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

const forageColor = {
  captage: '#60e0eb',
  rejet: '#a94645',
  piézomètre: '#FF732C',
} as const satisfies Record<ForageType, string>

export const DemarcheMap = defineComponent<Props>(props => {
  const mapRef = ref<HTMLDivElement | null>(null)
  const layersControlVisible = ref<boolean>(false)
  const map = ref<CaminoMapLibre | null>(null) as Ref<CaminoMapLibre | null>

  const defaultOverlayLayer = computed<Extract<OverlayName, 'Contours' | 'Points' | 'Titres valides' | 'Forages'>[]>(() => {
    const values: Extract<OverlayName, 'Contours' | 'Points' | 'Titres valides' | 'Forages'>[] = []
    if (props.neighbours !== null) {
      values.push('Titres valides')
    }
    values.push('Contours')
    if (props.maxMarkers > points.value.features.length) {
      values.push('Points')
    }

    if (canHaveForages(props.titreTypeId)) {
      values.push('Forages')
    }

    return values
  })

  const points = computed<DeepReadonly<FeatureCollectionPoints>>(() => {
    return {
      type: 'FeatureCollection',
      features: props.perimetre.geojson4326_points.features.map(feature => {
        return { ...feature, properties: { ...feature.properties, latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] } }
      }),
    }
  })

  const forages = computed<DeepReadonly<FeatureCollectionForages>>(() => {
    return {
      type: 'FeatureCollection',
      features:
        props.perimetre.geojson4326_forages?.features.map((feature, index) => {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              // Ajoute l’index pour gérer l’overlap entre les différents forages
              index: -index,
              color: forageColor[feature.properties.type],
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
            },
          }
        }) ?? [],
    }
  })

  const bounds = computed<CaminoLngLatBounds>(() => {
    const bounds: CaminoLngLatBounds = new LngLatBounds() as CaminoLngLatBounds
    props.perimetre.geojson4326_perimetre.geometry.coordinates.forEach(top => {
      top.forEach(lowerLever => lowerLever.forEach(coordinates => bounds.extend(coordinates)))
    })
    props.perimetre.geojson4326_forages?.features.forEach(feature => bounds.extend(feature.geometry.coordinates))

    return bounds
  })

  watch(
    () => props.perimetre,
    () => {
      map.value?.getSource(contoursSourceName).setData(props.perimetre.geojson4326_perimetre)
      map.value?.getSource(pointsSourceName).setData(points.value)
      map.value?.getSource(foragesSourceName).setData(forages.value)
    }
  )

  watch(
    () => [bounds.value, map.value],
    () => {
      if (isNotNullNorUndefined(map.value) && isNotNullNorUndefined(bounds.value)) {
        map.value?.fitBounds(bounds.value, { padding: 50 })
      }
    }
  )

  const moveend = async () => {
    if (props.neighbours !== null && isNotNullNorUndefined(map.value)) {
      const bounds = map.value.getBounds()

      try {
        const res: { elements: TitreWithPerimetre[] } = await props.neighbours.apiClient.getTitresWithPerimetreForCarte({
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

        map.value?.getSource('TitresValides').setData({
          type: 'FeatureCollection',
          features: res.elements
            .filter(({ slug }) => slug !== props.neighbours?.titreSlug)
            .filter(titreValide => isNotNullNorUndefined(titreValide.geojson4326Perimetre))
            .map(titreValide => {
              const properties: TitreValideProperties = {
                slug: titreValide.slug,
                nom: titreValide.nom,
                typeId: titreValide.typeId,
                titreStatutId: titreValide.titreStatutId,
                domaineColor: couleurParDomaine[getDomaineId(titreValide.typeId)],
              }

              // TODO 2023-12-04 un jour on espère pouvoir virer le ! parce que le filter l'empêche
              return { type: 'Feature', properties, geometry: titreValide.geojson4326Perimetre! }
            }),
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  onMounted(() => {
    const style: CaminoStyleSpecification = {
      version: 8,
      glyphs: 'https://etalab-tiles.fr/fonts/{fontstack}/{range}.pbf',
      sources: {
        ...layersSourceSpecifications,
        ...staticOverlayLayersSourceSpecification,
        [contoursSourceName]: {
          type: 'geojson',
          data: props.perimetre.geojson4326_perimetre,
        },
        [pointsSourceName]: {
          type: 'geojson',
          data: points.value,
        },

        [foragesSourceName]: {
          type: 'geojson',
          data: forages.value,
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
      const mapLibre: CaminoMapLibre = new Map({
        container: mapRef.value,
        cooperativeGestures: true,
        style: style as StyleSpecification,
        center: bounds.value.getCenter().toArray(),
        zoom: 16,
      }) as CaminoMapLibre

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

      mapLibre.on('moveend', moveend)

      mapLibre.on('click', contourPointsName, e => {
        if (e.features !== null && e.features !== undefined && e.features.length > 0) {
          new Popup({ closeButton: false, maxWidth: '500' })
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="fr-text--md fr-m-0" style="max-width: 400px;"><div>Latitude : <b>${e.features[0].properties.latitude}</b></div><div>Longitude : <b>${
                e.features[0].properties.longitude
              }</b></div>${isNotNullNorUndefined(e.features[0].properties.description) ? `<div>Description : ${e.features[0].properties.description}</div>` : ''}</div>`
            )
            .addTo(mapLibre)
        }
      })

      mapLibre.on('click', contourForagesName, e => {
        if (e.features !== null && e.features !== undefined && e.features.length > 0) {
          const properties = featureForagePropertiesValidator.safeParse(e.features[0].properties)
          if (properties.success) {
            new Popup({ closeButton: false, maxWidth: '500' })
              .setLngLat(e.lngLat)
              .setHTML(
                `<div class="fr-text--md fr-m-0" style="max-width: 400px;"><div>Latitude : <b>${e.features[0].properties.latitude}</b></div><div>Longitude : <b>${
                  e.features[0].properties.longitude
                }</b><div>Nom : <b>${properties.data.nom}</b><div>Profondeur : <b>${properties.data.profondeur} NGF</b></div><div>Type : <b>${capitalize(properties.data.type)}</b>${
                  isNotNullNorUndefined(properties.data.description) ? `<div>Description : ${properties.data.description}</div>` : ''
                }</div>`
              )
              .addTo(mapLibre)
          }
        }
      })

      const popup = new Popup({
        closeButton: false,
        maxWidth: '500',
      })

      mapLibre.on('mouseenter', titresValidesFillName, e => {
        if (e.features !== null && e.features !== undefined && e.features.length > 0) {
          const titreProperties = e.features[0].properties as TitreValideProperties

          popup.setLngLat(e.lngLat).setHTML(`<div class="fr-text--lg fr-m-0">${titreProperties.nom}</div>`).addTo(mapLibre)
        }
      })

      mapLibre.on('mouseleave', titresValidesFillName, () => {
        popup.remove()
      })

      mapLibre.on('click', titresValidesFillName, e => {
        if (e.features !== null && e.features !== undefined && e.features.length > 0) {
          const titreProperties = e.features[0].properties as TitreValideProperties
          props.neighbours?.router.push({ name: 'titre', params: { id: titreProperties.slug } })
        }
      })
    }
  })

  onUnmounted(() => {
    map.value?.remove()
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

  const selectedOverlayLayerNames = (overlayLayersToActivate: Readonly<OverlayName[]>) => {
    possibleOverlayLayers.value.forEach(layerName => {
      overlayMapNames[layerName].forEach(overlayLayerId => {
        if (map.value?.getLayer(overlayLayerId) && !overlayLayersToActivate.includes(layerName)) {
          map.value?.removeLayer(overlayLayerId)
        } else if (!map.value?.getLayer(overlayLayerId) && overlayLayersToActivate.includes(layerName)) {
          map.value?.addLayer(overlayConfigs[overlayLayerId])
        }
      })
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

  const possibleOverlayLayers = computed<OverlayName[]>(() => {
    return overlayNames.filter(name => {
      if (isNullOrUndefined(props.neighbours) && name === 'Titres valides') {
        return false
      }
      if (!canHaveForages(props.titreTypeId) && name === 'Forages') {
        return false
      }

      return true
    })
  })
  return () => (
    <div ref={mapRef} class={props.class} style={{ minHeight: '400px' }}>
      <LayersControl
        id={id}
        style={{ display: layersControlVisible.value ? 'block' : 'none', zIndex: 3 }}
        onMouseleave={layerControlOnMouseleave}
        setLayer={selectLayer}
        selectedOverlayLayerNames={selectedOverlayLayerNames}
        defaultOverlayLayer={defaultOverlayLayer.value}
        overlays={possibleOverlayLayers.value}
      />
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
DemarcheMap.props = ['perimetre', 'class', 'style', 'maxMarkers', 'neighbours', 'router', 'titreTypeId']
