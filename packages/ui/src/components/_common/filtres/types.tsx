import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'

export type Props = {
  element: {
    id: `${TitreTypeTypeId}-${DomaineId}` | TitreTypeTypeId
    nom: string
  }
}

export function FiltresTypes(props: Props) {
  return (
    <span>
      <svg width="24" height="24" class="mr-s mb--xs">
        <rect
          width="24"
          height="24"
          class={`svg-fill-pattern-${props.element.id}`}
        />
      </svg>
      <span class="cap-first h6 bold">{props.element.nom}</span>
    </span>
  )
}
