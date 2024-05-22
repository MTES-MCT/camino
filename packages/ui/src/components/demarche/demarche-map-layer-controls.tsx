import { HTMLAttributes, defineComponent, computed, DeepReadonly } from 'vue'
import 'maplibre-gl/dist/maplibre-gl.css'
import { DsfrSeparator } from '../_ui/dsfr-separator'
import { useState } from '@/utils/vue-tsx-utils'
import { getEntriesHardcore } from 'camino-common/src/typescript-tools'
import { DsfrInputRadio } from '../_ui/dsfr-input-radio'
import { DsfrInputCheckboxes } from '../_ui/dsfr-input-checkboxes'
import { z } from 'zod'

export const contoursSourceName = 'Contours'
export const pointsSourceName = 'Points'
export const foragesSourceName = 'Forages'
export const contoursLineName = 'ContoursLine'
export const contourPointsName = 'ContoursPoints'
export const contourForagesName = 'ContoursForages'
export const contourForagesLabel = 'ContoursForagesLabel'
export const titresValidesFillName = 'TitresValidesFill'
export const titresValidesLineName = 'TitresValidesLine'
const baseMapNames = {
  'OSM / fr': 'osm',
  'OSM / hot': 'hot',
  'Géoportail / Plan IGN': 'geoIGN',
  'Géoportail / Photographies aériennes': 'geoAer',
  'BRGM / Cartes géologiques 1/50 000': 'BRGMGeo',
} as const satisfies Record<string, LayerId>

export const layers = ['osm', 'hot', 'geoIGN', 'geoAer', 'BRGMGeo'] as const
const layerIdValidator = z.enum(layers)
export type LayerId = z.infer<typeof layerIdValidator>
type LayersControlProps = {
  id: string
  onMouseleave: HTMLAttributes['onMouseleave']
  style?: HTMLAttributes['style']
  setLayer: (layer: LayerId) => void
  selectedOverlayLayerNames: (overlay: Readonly<OverlayName[]>) => void
  defaultOverlayLayer: OverlayName[]
  overlays: OverlayName[]
}

export const sdomOverlayName = 'SDOM (schéma départemental d’orientation minière)'

export const overlayLayers = [
  'SDOM',
  'Facades',
  'RedevanceArcheologiePreventive',
  titresValidesFillName,
  titresValidesLineName,
  'ContoursFill',
  contoursLineName,
  contourPointsName,
  'ContoursPointLabels',
  contourForagesName,
  contourForagesLabel,
] as const
export const overlayLayerIdValidator = z.enum(overlayLayers)
export type OverlayLayerId = z.infer<typeof overlayLayerIdValidator>

export const overlayNames = [
  sdomOverlayName,
  'Façades maritimes',
  'Limite de la redevance d’archéologie préventive',
  contoursSourceName,
  pointsSourceName,
  foragesSourceName,
  'Titres valides',
] as const
export const overlayNameValidator = z.enum(overlayNames)
export type OverlayName = z.infer<typeof overlayNameValidator>

export const overlayMapNames = {
  [sdomOverlayName]: ['SDOM'],
  'Façades maritimes': ['Facades'],
  'Limite de la redevance d’archéologie préventive': ['RedevanceArcheologiePreventive'],
  [contoursSourceName]: [contoursLineName, 'ContoursFill'],
  [pointsSourceName]: [contourPointsName, 'ContoursPointLabels'],
  [foragesSourceName]: [contourForagesName, contourForagesLabel],
  'Titres valides': [titresValidesLineName, titresValidesFillName],
} as const satisfies Record<OverlayName, Readonly<OverlayLayerId[]>>
export const LayersControl = defineComponent<LayersControlProps>(props => {
  const defaultBaseLayer = 'osm'

  const [selectedLayers, updateSelectedLayers] = useState(props.defaultOverlayLayer)
  const radioValueChanged = (layer: LayerId) => {
    props.setLayer(layer)
  }

  const checkboxValueChanged = (overlayLayerNames: DeepReadonly<OverlayName[]>) => {
    updateSelectedLayers(overlayLayerNames)
    props.selectedOverlayLayerNames(overlayLayerNames)
  }

  const elements = computed(() => {
    return props.overlays.map(name => {
      return { legend: { main: name }, itemId: name }
    })
  })

  return () => (
    <div class="maplibregl-ctrl-top-right" id={props.id} style={props.style} onMouseleave={props.onMouseleave}>
      <div class="maplibregl-ctrl maplibregl-ctrl-group fr-p-2w" style={{ zIndex: 3 }}>
        <DsfrInputRadio
          style={{ marginBottom: 0 }}
          elements={getEntriesHardcore(baseMapNames).map(([name, layer]) => {
            return { itemId: layer, legend: { main: name } }
          })}
          valueChanged={radioValueChanged}
          legend={{ main: '' }}
          size="sm"
          initialValue={defaultBaseLayer}
        />
        <DsfrSeparator size="sm" />
        <DsfrInputCheckboxes style={{ marginBottom: 0 }} elements={elements.value} legend={{ main: '' }} valueChanged={checkboxValueChanged} size="sm" initialCheckedValue={selectedLayers.value} />
      </div>
    </div>
  )
})
// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
LayersControl.props = ['id', 'onMouseleave', 'style', 'setLayer', 'selectedOverlayLayerNames', 'defaultOverlayLayer', 'overlays']
