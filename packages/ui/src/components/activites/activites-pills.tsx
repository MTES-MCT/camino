import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Badge } from '../_ui/badge'

interface Props {
  activitesAbsentes?: number
  activitesEnConstruction?: number
}

export const ActivitesPills: FunctionalComponent<Props> = props => {
  return (
    <span>{props.activitesAbsentes || props.activitesEnConstruction ? <div class='dsfr'>
    <ul class='fr-badges-group'>
    {props.activitesAbsentes ? (
      <li><Badge ariaLabel={`${props.activitesAbsentes} activités absentes`} label={props.activitesAbsentes} systemLevel='error' /></li>
    ) : null}

    {props.activitesEnConstruction ? (
      <li><Badge ariaLabel={`${props.activitesEnConstruction} activités en construction`} label={props.activitesEnConstruction} systemLevel='warning' /></li>
    ) : null}
    </ul>
  </div> : null }</span>
    
  )
}
