import { FunctionalComponent } from 'vue'
import { Badge } from '../_ui/badge'
import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { Alert } from '../_ui/alert'

type Props = {
  step: { name: string; help: string | null }
  complete: boolean
  enConstruction: true
  render: JSX.Element
}

export const Bloc: FunctionalComponent<Props> = (props, context) => {
  return (
    <div>
      <div class="dsfr">
        <h2 class="cap-first  fr-pt-6w">{props.step.name}</h2>
        {!props.complete ? <Badge badgeSize="sm" systemLevel="error" ariaLabel="Incomplet" /> : null}

        {isNotNullNorUndefined(props.step.help) ? <Alert small={true} title={props.step.help} type="info" /> : null}
      </div>
      {/* TODO 2024-02-12 utiliser la class DSFR fr-pt-3w une fois tous les composants dessous dsfr-isés */}
      <div style={{ paddingTop: '24px' }}>{context.slots.default?.()}</div>
    </div>
  )
}
