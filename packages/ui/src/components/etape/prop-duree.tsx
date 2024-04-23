import { isNotNullNorUndefined } from 'camino-common/src/typescript-tools'
import { FunctionalComponent } from 'vue'

interface Props {
  duree?: number
}
export const PropDuree: FunctionalComponent<Props> = props => {
  const ans = isNotNullNorUndefined(props.duree) ? Math.floor(props.duree / 12) : 0
  const mois = isNotNullNorUndefined(props.duree) ? Math.floor(props.duree % 12) : 0

  return (
    <span>
      {ans ? <span>{`${ans} an${ans > 1 ? 's' : ''}`}</span> : null}
      {ans && mois ? <span> et </span> : null}
      {mois ? <span>{`${mois} mois`}</span> : null}
    </span>
  )
}
