import { FunctionalComponent } from 'vue'
import { Badge } from '../_ui/badge'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'

interface Props {
  activitesAbsentes?: number
  activitesEnConstruction?: number
}

export const ActivitesPills: FunctionalComponent<Props> = props => {
  return (
    <span>
      {(isNotNullNorUndefined(props.activitesAbsentes) && props.activitesAbsentes !== 0) || (isNotNullNorUndefined(props.activitesEnConstruction) && props.activitesEnConstruction !== 0) ? (
        <div class="dsfr">
          <ul class="fr-badges-group">
            {isNotNullNorUndefined(props.activitesAbsentes) && props.activitesAbsentes !== 0 ? (
              <li>
                <Badge ariaLabel={`${props.activitesAbsentes} activités absentes`} label={props.activitesAbsentes} systemLevel="error" />
              </li>
            ) : null}

            {isNotNullNorUndefined(props.activitesEnConstruction) && props.activitesEnConstruction !== 0 ? (
              <li>
                <Badge ariaLabel={`${props.activitesEnConstruction} activités en construction`} label={props.activitesEnConstruction} systemLevel="warning" />
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </span>
  )
}
