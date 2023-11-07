import * as leaflet from 'leaflet'

// export class Map extends Evented {

//     isFullscreen(): boolean;
// }
export class CaminoLeafletMap extends leaflet.Map {
  isFullscreen(): boolean
  gestureHandling: {
    disable(): void
    enable(): void
  }
}

declare module 'leaflet' {
  export interface CaminoLeafletMapOptions extends leaflet.MapOptions {
    gestureHandling: boolean
    fullscreenControl: {
      pseudoFullscreen: boolean
    }
  }
  export function map(element: string | HTMLElement, options?: CaminoLeafletMapOptions): CaminoLeafletMap
}
