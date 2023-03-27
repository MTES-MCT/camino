import { FunctionalComponent } from 'vue'
import { Statut } from '../_common/statut'

interface Props {
  activitesAbsentes?: number
  activitesEnConstruction?: number
}

export const ActivitesPills: FunctionalComponent<Props> = props => {
  return (
    <div class="mb--s">
      {props.activitesAbsentes ? (
        <span class="mr-xs inline-block">
          <Statut color="error" nom={props.activitesAbsentes.toString(10)} />
        </span>
      ) : null}

      {props.activitesEnConstruction ? (
        <span class="mr-xs inline-block">
          <Statut color="warning" nom={props.activitesEnConstruction.toString(10)} />
        </span>
      ) : null}
    </div>
  )
}
