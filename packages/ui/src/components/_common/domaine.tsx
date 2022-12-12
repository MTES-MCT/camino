import { DomaineId, DOMAINES_IDS } from 'camino-common/src/static/domaines'
import Pill from '../_ui/pill.vue'

export type Props = {
  domaineId?: DomaineId
}

export function Domaine(props: Props) {
  let domaine = props.domaineId
  if (domaine === undefined) {
    domaine = DOMAINES_IDS.METAUX
  }

  return (
    <Pill color={`bg-domaine-${domaine}`} class="mono">
      {domaine}
    </Pill>
  )
}
