import { FunctionalComponent } from 'vue'
import { Badge } from '../_ui/badge'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'
import { capitalize } from 'camino-common/src/strings'

type Props = {
  step: { name: string; help: string | null }
  complete: boolean
}

export const Bloc: FunctionalComponent<Props> = (props, context) => {
  return (
    <div>
      <div>
        <h2 class="fr-pt-6w">
          {capitalize(props.step.name)}
          {!props.complete ? <Badge class="fr-ml-2w" badgeSize="sm" systemLevel="error" ariaLabel="Incomplet" /> : null}
        </h2>

        {isNotNullNorUndefined(props.step.help) ? <Alert small={true} title={props.step.help} type="info" /> : null}
      </div>
      <div>{context.slots.default?.()}</div>
    </div>
  )
}
