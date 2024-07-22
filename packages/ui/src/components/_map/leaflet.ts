import type { LatLngExpression, Icon, DivIcon, GeoJSONOptions, DivIconOptions, MarkerOptions, GeoJSON, Marker, LatLng, LatLngBounds } from 'leaflet'
import type { GeoJsonObject, Geometry, LineString } from 'geojson'
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

export const leafletMarkerBuild = (latLng: LatLngExpression, icon: Icon | DivIcon | undefined, options?: MarkerOptions | undefined): Marker<any> => L.marker(latLng, { icon, ...options })

export const leafletGeojsonBuild = (geojson: GeoJsonObject | undefined, options?: GeoJSONOptions<any> | undefined): GeoJSON<any, Geometry> => L.geoJSON(geojson, options)

export const leafletGeojsonCenterFind = (geojson: GeoJsonObject | undefined): LatLng => L.geoJSON(geojson).getBounds().getCenter()

export const leafletDivIconBuild = (divIconOptions: DivIconOptions): DivIcon => L.divIcon(divIconOptions)
export const leafletGeojsonBoundsGet = (zone: LineString): LatLngBounds => L.geoJSON(zone).getBounds()
