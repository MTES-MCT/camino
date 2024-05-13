import { DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { capitalize } from 'camino-common/src/strings'
import { FunctionalComponent } from 'vue'

export type Props = {
  element: {
    id: `${TitreTypeTypeId}-${DomaineId}` | TitreTypeTypeId
    nom: string
  }
}

export const FiltresTypes: FunctionalComponent<Props> = (props: Props) => {
  return (
    <span>
      <svg width="24" height="24" class="mr-s mb--xs">
        <rect width="24" height="24" class={`svg-fill-pattern-${props.element.id}`} />
      </svg>
      <span class="h6 bold">{capitalize(props.element.nom)}</span>
    </span>
  )
}
