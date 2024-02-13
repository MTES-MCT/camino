import { FunctionalComponent } from 'vue'
import { Badge } from '../_ui/badge'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'

type Props = {
  step: { name: string; help: string | null }
  complete: boolean
}

export const Bloc: FunctionalComponent<Props> = (props, context) => {
  return (
    <div>
      <div class="dsfr">
        <h2 class="cap-first fr-pt-6w">{props.step.name}</h2>
        {!props.complete ? <Badge badgeSize="sm" systemLevel="error" ariaLabel="Incomplet" /> : null}

        {isNotNullNorUndefined(props.step.help) ? <Alert small={true} title={props.step.help} type="info" /> : null}
      </div>
      <div>{context.slots.default?.()}</div>
    </div>
  )
}
