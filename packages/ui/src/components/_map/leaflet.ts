import type { LatLngExpression, Icon, DivIcon, GeoJSONOptions, DivIconOptions, MarkerOptions } from 'leaflet'
import type { GeoJsonObject } from 'geojson'
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
  shadowSize: [41, 41],
})

export const leafletMarkerBuild = (latLng: LatLngExpression, icon: Icon | DivIcon | undefined, options?: MarkerOptions | undefined) => L.marker(latLng, { icon, ...options })

export const leafletGeojsonBuild = (geojson: GeoJsonObject | undefined, options?: GeoJSONOptions<any> | undefined) => L.geoJSON(geojson, options)

export const leafletGeojsonCenterFind = (geojson: GeoJsonObject | undefined) => L.geoJSON(geojson).getBounds().getCenter()

export const leafletDivIconBuild = (divIconOptions: DivIconOptions) => L.divIcon(divIconOptions)
export const leafletGeojsonBoundsGet = (zone: GeoJsonObject | undefined) => L.geoJSON(zone).getBounds()
