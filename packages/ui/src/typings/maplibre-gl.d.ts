import * as maplibre from 'maplibre-gl'
import { DeepReadonly } from 'vue'

export type CaminoMapOptions = maplibre.MapOptions & { style: CaminoStyleSpecification }
export class CaminoMapLibre extends maplibre.Map {
  constructor(options: maplibre.MapOptions)
  getSource(id: string): CaminoGeoJSONSource | undefined
}

export class CaminoLngLatBounds extends maplibre.LngLatBounds {
  extend(obj: DeepReadonly<maplibre.LngLatLike | maplibre.LngLatBoundsLike>): this
}

export class CaminoGeoJSONSource extends maplibre.GeoJSONSource {
  setData(data: string | DeepReadonly<maplibre.GeoJSON>): this
}

export class CaminoStyleSpecification extends maplibre.StyleSpecification {}
