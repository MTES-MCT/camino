import * as maplibre from 'maplibre-gl'

export class CaminoMapLibre extends maplibre.Map {
  getSource(id: string): maplibre.GeoJSONSource
}

declare module 'maplibre' {
  export declare class CaminoMapLibre extends maplibre.Map {}
}
