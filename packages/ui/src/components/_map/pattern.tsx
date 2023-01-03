import { domainesIds } from 'camino-common/src/static/domaines'
import {
  TitresTypesTypes,
  TitreTypeTypeId
} from 'camino-common/src/static/titresTypesTypes'
import { FunctionalComponent } from 'vue'

const domainesIdsDefault = [...domainesIds, ''] as const
const defs: Record<
  TitreTypeTypeId,
  { d: string; width: number; rotation: number }
> = {
  ax: { d: 'M0,0 l8,0 M0,8 l8,0', width: 5, rotation: 0 },
  cx: { d: 'M0,0 l8,0 M0,8 l8,0', width: 5, rotation: 45 },
  pc: { d: 'M0,0 l8,0 M0,8 l8,0', width: 5, rotation: 90 },
  px: { d: 'M0,0 l8,0 M0,8 l8,0', width: 5, rotation: 135 },
  ap: { d: 'M-1,4 l2,0 M6,4 l2,0', width: 2, rotation: 45 },
  ar: { d: 'M1,4 l4,0 M3,2 l0,4', width: 2, rotation: 0 },
  pr: { d: 'M4,4 l0,0', width: 5, rotation: 45 },
  in: {
    d: 'M0,4 a3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0',
    width: 1,
    rotation: 0
  }
} as const
export const MapPattern: FunctionalComponent = () => {
  return (
    <svg class="absolute z--100">
      <defs>
        {Object.values(TitresTypesTypes).map(ttt => {
          return (
            <g key={ttt.id}>
              <g>
                {domainesIdsDefault.map(domaineId => {
                  return (
                    <pattern
                      id={
                        domaineId
                          ? `pattern-${ttt.id}-${domaineId}`
                          : `pattern-${ttt.id}`
                      }
                      key={domaineId}
                      patternUnits="userSpaceOnUse"
                      width="8"
                      height="8"
                      patternTransform={`rotate(${defs[ttt.id].rotation})`}
                    >
                      <path
                        d={defs[ttt.id].d}
                        class={
                          domaineId
                            ? `svg-stroke-domaine-${domaineId}`
                            : `svg-stroke`
                        }
                        stroke-width={defs[ttt.id].width}
                        stroke-linecap="round"
                        fill="none"
                      />
                    </pattern>
                  )
                })}
              </g>
            </g>
          )
        })}
      </defs>
    </svg>
  )
}
