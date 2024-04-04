import * as maplibre from 'maplibre-gl'

export class CaminoMapLibre extends maplibre.Map {
  getSource(id: string): CaminoGeoJSONSource
}


export class CaminoLngLatBounds extends maplibre.LngLatBounds {
  extend(obj: DeepReadonly<maplibre.LngLatLike | maplibre.LngLatBoundsLike>): this
}


export class CaminoGeoJSONSource extends maplibre.GeoJSONSource {
  setData(data: string | DeepReadonly<GeoJSON>): this;
}
