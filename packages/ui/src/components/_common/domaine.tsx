import { DomaineId, DOMAINES_IDS } from 'camino-common/src/static/domaines'
import { FunctionalComponent, HTMLAttributes } from 'vue'
import { Pill } from '../_ui/pill'

export type Props = {
  domaineId?: DomaineId
} & HTMLAttributes

export const Domaine: FunctionalComponent<Props> = props => {
  let domaine = props.domaineId
  if (domaine === undefined) {
    domaine = DOMAINES_IDS.METAUX
  }

  return <Pill color={`bg-domaine-${domaine}`} class="mono" text={domaine} />
}
