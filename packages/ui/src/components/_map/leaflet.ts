import type {
  LatLngExpression,
  Icon,
  DivIcon,
  GeoJSONOptions,
  DivIconOptions,
  IconOptions
} from 'leaflet'
import { GeoJsonObject } from 'geojson'
import 'leaflet.markercluster'
import 'leaflet-gesture-handling'
import 'leaflet-fullscreen'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const L = window.L

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

export const leafletMarkerBuild = (
  latLng: LatLngExpression,
  icon: Icon | DivIcon | undefined
) => L.marker(latLng, { icon })

export const leafletGeojsonBuild = (
  geojson: GeoJsonObject | undefined,
  options?: GeoJSONOptions<any> | undefined
) => L.geoJSON(geojson, options)

export const leafletMarkerClusterGroupBuild = (
  divIconOptions: DivIconOptions
) =>
  L.markerClusterGroup({
    iconCreateFunction(cluster) {
      const childCount = cluster.getChildCount()

      let size
      if (childCount < 5) size = 'xs'
      else if (childCount < 15) size = 's'
      else if (childCount < 40) size = 'm'
      else size = 'l'

      divIconOptions.className += ` leaflet-marker-cluster-${size}`

      return new L.DivIcon(divIconOptions)
    },
    disableClusteringAtZoom: 10,
    animate: true,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    maxClusterRadius(x) {
      return 2048 / Math.pow(x, 2)
    }
  })

export const leafletGeojsonCenterFind = (geojson: GeoJsonObject | undefined) =>
  L.geoJSON(geojson).getBounds().getCenter()

export const leafletDivIconBuild = (divIconOptions: DivIconOptions) =>
  L.divIcon(divIconOptions)
export const leafletIconBuild = (iconOptions: IconOptions) =>
  L.icon(iconOptions)
export const leafletGeojsonBoundsGet = (zone: GeoJsonObject | undefined) =>
  L.geoJSON(zone).getBounds()
